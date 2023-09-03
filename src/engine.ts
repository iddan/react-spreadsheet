import FormulaParser, { FormulaError, Value } from "fast-formula-parser";
import { getReferences } from "./formula";
import * as Matrix from "./matrix";
import * as Formula from "./formula";
import { Point } from "./point";
import { PointGraph } from "./point-graph";
import { PointSet } from "./point-set";
import { CellBase, CreateFormulaParser } from "./types";

export class Model<Cell extends CellBase> {
  readonly data!: Matrix.Matrix<Cell>;
  readonly evaluatedData!: Matrix.Matrix<Cell>;
  readonly referenceGraph!: PointGraph;
  readonly createFormulaParser!: CreateFormulaParser;

  constructor(
    createFormulaParser: CreateFormulaParser,
    data: Matrix.Matrix<Cell>,
    referenceGraph?: PointGraph,
    evaluatedData?: Matrix.Matrix<Cell>
  ) {
    this.createFormulaParser = createFormulaParser;
    this.data = data;
    this.referenceGraph = referenceGraph || createReferenceGraph(data);
    this.evaluatedData =
      evaluatedData ||
      createEvaluatedData(
        data,
        this.referenceGraph,
        this.createFormulaParser(data)
      );
  }
}

export function updateCellValue<Cell extends CellBase>(
  model: Model<Cell>,
  point: Point,
  cell: Cell
): Model<Cell> {
  const nextData = Matrix.set(point, cell, model.data);
  const nextReferenceGraph = Formula.isFormulaValue(cell.value)
    ? updateReferenceGraph(model.referenceGraph, point, cell, nextData)
    : model.referenceGraph;

  const formulaParser = model.createFormulaParser(nextData);
  const nextEvaluatedData = evaluateCell(
    model.evaluatedData,
    nextData,
    nextReferenceGraph,
    point,
    cell,
    formulaParser
  );
  return new Model(
    model.createFormulaParser,
    nextData,
    nextReferenceGraph,
    nextEvaluatedData
  );
}

function updateReferenceGraph(
  referenceGraph: PointGraph,
  point: Point,
  cell: CellBase<string>,
  data: Matrix.Matrix<CellBase>
): PointGraph {
  const references = getReferences(
    Formula.extractFormula(cell.value),
    point,
    data
  );
  const nextReferenceGraph = referenceGraph.set(point, references);
  return nextReferenceGraph;
}

function evaluateCell<Cell extends CellBase>(
  prevEvaluatedData: Matrix.Matrix<Cell>,
  data: Matrix.Matrix<Cell>,
  referenceGraph: PointGraph,
  point: Point,
  cell: Cell,
  formulaParser: FormulaParser
): Matrix.Matrix<Cell> {
  if (referenceGraph.hasCircularDependency(point)) {
    let visited = PointSet.from([point]);
    let nextEvaluatedData = Matrix.set(
      point,
      { ...cell, value: FormulaError.REF },
      prevEvaluatedData
    );
    for (const referrer of referenceGraph.getBackwardsRecursive(point)) {
      if (visited.has(referrer)) {
        break;
      }
      visited = visited.add(referrer);
      const referrerCell = Matrix.get(referrer, data);
      if (!referrerCell) {
        continue;
      }
      nextEvaluatedData = Matrix.set(
        referrer,
        { ...referrerCell, value: FormulaError.REF },
        nextEvaluatedData
      );
    }
    return nextEvaluatedData;
  }

  let nextEvaluatedData = prevEvaluatedData;

  const evaluatedValue = Formula.isFormulaValue(cell.value)
    ? getFormulaComputedValue(cell.value, point, formulaParser)
    : cell.value;

  const evaluatedCell = { ...cell, value: evaluatedValue };

  nextEvaluatedData = Matrix.set(point, evaluatedCell, nextEvaluatedData);

  // for every formula cell that references the cell re-evaluate (recursive)
  for (const referrer of referenceGraph.getBackwardsRecursive(point)) {
    const referrerCell = Matrix.get(referrer, data);
    if (!referrerCell) {
      continue;
    }
    const evaluatedValue = Formula.isFormulaValue(referrerCell.value)
      ? getFormulaComputedValue(referrerCell.value, point, formulaParser)
      : referrerCell.value;
    const evaluatedCell = { ...referrerCell, value: evaluatedValue };
    nextEvaluatedData = Matrix.set(referrer, evaluatedCell, nextEvaluatedData);
  }

  return nextEvaluatedData;
}

/**
 *
 * @param data - the spreadsheet data
 * @returns the spreadsheet reference graph
 */
export function createReferenceGraph(
  data: Matrix.Matrix<CellBase>
): PointGraph {
  const entries: Array<[Point, PointSet]> = [];
  for (const [point, cell] of Matrix.entries(data)) {
    if (cell && Formula.isFormulaValue(cell.value)) {
      const references = getReferences(
        Formula.extractFormula(cell.value),
        point,
        data
      );
      entries.push([point, references]);
    }
  }
  return PointGraph.from(entries);
}

export function createEvaluatedData<Cell extends CellBase>(
  data: Matrix.Matrix<Cell>,
  referenceGraph: PointGraph,
  formulaParser: FormulaParser
): Matrix.Matrix<Cell> {
  let evaluatedData = data;

  // Iterate over the points in the reference graph, starting from the leaves
  for (const point of referenceGraph.traverseBFS()) {
    // Get the cell at the current point in the data Matrix
    const cell = Matrix.get(point, data);
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
      evaluatedData = Matrix.set(
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
  try {
    return Formula.evaluate(formula, point, formulaParser);
  } catch (e) {
    return FormulaError.REF;
  }
}
