import FormulaParser, { Value } from "fast-formula-parser";
import { getReferences } from "./formula";
import * as matrix from "./matrix";
import * as Formula from "./formula";
import { Point } from "./point";
import * as pointGraph from "./point-graph";
import * as pointSet from "./point-set";
import { CellBase } from "./types";

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
  const nextReferenceGraph = Formula.isFormulaValue(cell.value)
    ? updateReferenceGraph(model.referenceGraph, point, cell, nextData)
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
  cell: CellBase<string>,
  data: matrix.Matrix<CellBase>
): pointGraph.PointGraph {
  const references = getReferences(
    Formula.extractFormula(cell.value),
    point,
    data
  );
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

  const formulaParser = Formula.createBoundFormulaParser(
    () => nextEvaluatedData
  );

  const evaluatedValue = Formula.isFormulaValue(cell.value)
    ? getFormulaComputedValue(cell.value, point, formulaParser)
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
    const evaluatedValue = Formula.isFormulaValue(referrerCell.value)
      ? getFormulaComputedValue(referrerCell.value, point, formulaParser)
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
    if (cell && Formula.isFormulaValue(cell.value)) {
      const references = getReferences(
        Formula.extractFormula(cell.value),
        point,
        data
      );
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

  const formulaParser = Formula.createBoundFormulaParser(() => evaluatedData);

  // Iterate over the points in the reference graph, starting from the leaves
  for (const point of pointGraph.traverseBFS(referenceGraph)) {
    // Get the cell at the current point in the data matrix
    const cell = matrix.get(point, data);
    if (!cell) {
      continue;
    }

    // If the cell is a formula cell, evaluate it
    if (Formula.isFormulaValue(cell.value)) {
      const evaluatedValue = getFormulaComputedValue(
        cell.value,
        point,
        formulaParser
      );
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
  value: string,
  point: Point,
  formulaParser: FormulaParser
): Value {
  const formula = Formula.extractFormula(value);
  return Formula.evaluate(formula, point, formulaParser);
}
