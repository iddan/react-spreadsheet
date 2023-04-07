import * as hotFormulaParser from "hot-formula-parser";
import { getReferences } from "./formula";
import * as matrix from "./matrix";
import * as Formula from "./formula";
import { Point } from "./point";
import * as pointGraph from "./point-graph";
import * as pointSet from "./point-set";
import { CellBase } from "./types";
import { isFormulaCell, transformCoordToPoint } from "./util";

type FormulaParseResult = string | boolean | number;
type FormulaParseError = string;
type FormulaComputedValue = FormulaParseResult | FormulaParseError | null;

export class Model<Cell extends CellBase> {
  readonly data!: matrix.Matrix<Cell>;
  readonly evaluatedData!: matrix.Matrix<Cell>;

  readonly referenceGraph!: pointGraph.PointGraph;

  constructor(
    data: matrix.Matrix<Cell>,
    referenceGraph?: pointGraph.PointGraph,
    evaluatedData?: matrix.Matrix<Cell>
  ) {
    this.data = data;
    this.referenceGraph = referenceGraph || createReferenceGraph(data);
    this.evaluatedData =
      evaluatedData || createEvaluatedData(data, this.referenceGraph);
  }
}

export function updateCellValue<Cell extends CellBase>(
  model: Model<Cell>,
  point: Point,
  cell: Cell
): Model<Cell> {
  const nextData = matrix.set(point, cell, model.data);
  const nextReferenceGraph = isFormulaCell(cell)
    ? updateReferenceGraph(model.referenceGraph, point, cell)
    : model.referenceGraph;

  const nextEvaluatedData = evaluateCell(
    model.evaluatedData,
    nextData,
    nextReferenceGraph,
    point,
    cell
  );
  return new Model(nextData, nextReferenceGraph, nextEvaluatedData);
}

function updateReferenceGraph(
  referenceGraph: pointGraph.PointGraph,
  point: Point,
  cell: CellBase<string>
): pointGraph.PointGraph {
  const references = getReferences(cell.value);
  const nextReferenceGraph = pointGraph.set(point, references, referenceGraph);
  return nextReferenceGraph;
}

function evaluateCell<Cell extends CellBase>(
  prevEvaluatedData: matrix.Matrix<Cell>,
  data: matrix.Matrix<Cell>,
  referenceGraph: pointGraph.PointGraph,
  point: Point,
  cell: Cell
): matrix.Matrix<Cell> {
  if (pointGraph.hasCircularDependency(referenceGraph, point)) {
    let visited = pointSet.from([point]);
    let nextEvaluatedData = matrix.set(
      point,
      { ...cell, value: "#REF!" },
      prevEvaluatedData
    );
    for (const referrer of pointGraph.getBackwardsRecursive(
      point,
      referenceGraph
    )) {
      if (pointSet.has(visited, referrer)) {
        break;
      }
      visited = pointSet.add(referrer, visited);
      const referrerCell = matrix.get(referrer, data);
      if (!referrerCell) {
        continue;
      }
      nextEvaluatedData = matrix.set(
        referrer,
        { ...referrerCell, value: "#REF!" },
        nextEvaluatedData
      );
    }
    return nextEvaluatedData;
  }

  let nextEvaluatedData = prevEvaluatedData;

  const formulaParser = new hotFormulaParser.Parser();
  formulaParser.on("callCellValue", (cellCoord, done) => {
    let value;
    try {
      const point = transformCoordToPoint(cellCoord);
      const cell = matrix.get(point, nextEvaluatedData);
      value = cell?.value;
    } catch (error) {
      console.error(error);
    } finally {
      done(value);
    }
  });

  formulaParser.on("callRangeValue", (startCellCoord, endCellCoord, done) => {
    let values;
    try {
      const start = transformCoordToPoint(startCellCoord);
      const end = transformCoordToPoint(endCellCoord);
      values = matrix.toArray(matrix.slice(start, end, nextEvaluatedData));
    } catch (error) {
      console.error(error);
    } finally {
      done(values);
    }
  });

  const evaluatedValue = isFormulaCell(cell)
    ? getFormulaComputedValue(cell, formulaParser)
    : cell.value;

  const evaluatedCell = { ...cell, value: evaluatedValue };

  nextEvaluatedData = matrix.set(point, evaluatedCell, nextEvaluatedData);

  // for every formula cell that references the cell re-evaluate (recursive)
  for (const referrer of pointGraph.getBackwardsRecursive(
    point,
    referenceGraph
  )) {
    const referrerCell = matrix.get(referrer, data);
    if (!referrerCell) {
      continue;
    }
    const evaluatedValue = isFormulaCell(referrerCell)
      ? getFormulaComputedValue(referrerCell, formulaParser)
      : referrerCell.value;
    const evaluatedCell = { ...referrerCell, value: evaluatedValue };
    nextEvaluatedData = matrix.set(referrer, evaluatedCell, nextEvaluatedData);
  }

  return nextEvaluatedData;
}

/**
 *
 * @param data - the spreadsheet data
 * @returns the spreadsheet reference graph
 */
export function createReferenceGraph(
  data: matrix.Matrix<CellBase>
): pointGraph.PointGraph {
  const entries: Array<[Point, pointSet.PointSet]> = [];
  for (const [point, cell] of matrix.entries(data)) {
    if (cell && isFormulaCell(cell)) {
      /** @todo handle range references */
      const references = getReferences(cell.value);
      entries.push([point, references]);
    }
  }
  return pointGraph.from(entries);
}

export function createEvaluatedData<Cell extends CellBase>(
  data: matrix.Matrix<Cell>,
  referenceGraph: pointGraph.PointGraph
): matrix.Matrix<Cell> {
  let evaluatedData = data;

  const formulaParser = new hotFormulaParser.Parser();

  formulaParser.on("callCellValue", (cellCoord, done) => {
    let value;
    try {
      const point = transformCoordToPoint(cellCoord);
      value = matrix.get(point, evaluatedData);
    } catch (error) {
      console.error(error);
    } finally {
      done(value);
    }
  });

  formulaParser.on("callRangeValue", (startCellCoord, endCellCoord, done) => {
    let values;
    try {
      const start = transformCoordToPoint(startCellCoord);
      const end = transformCoordToPoint(endCellCoord);
      values = matrix.toArray(matrix.slice(start, end, evaluatedData));
    } catch (error) {
      console.error(error);
    } finally {
      done(values);
    }
  });

  // Iterate over the points in the reference graph, starting from the leaves
  for (const point of pointGraph.traverseBFS(referenceGraph)) {
    // Get the cell at the current point in the data matrix
    const cell = matrix.get(point, data);
    if (!cell) {
      continue;
    }

    // If the cell is a formula cell, evaluate it
    if (isFormulaCell(cell)) {
      const evaluatedValue = getFormulaComputedValue(cell, formulaParser);
      evaluatedData = matrix.set(
        point,
        { ...cell, value: evaluatedValue },
        evaluatedData
      );
    }
  }

  return evaluatedData;
}

/** Get the computed value of a formula cell */
export function getFormulaComputedValue(
  cell: CellBase<string>,
  formulaParser: hotFormulaParser.Parser
): FormulaComputedValue {
  const formula = Formula.extractFormula(cell.value);
  const { result, error } = formulaParser.parse(formula);
  return error || result;
}
