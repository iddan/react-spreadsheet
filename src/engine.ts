import * as hotFormulaParser from "hot-formula-parser";
import { getReferences } from "./formula";
import * as matrix from "./matrix";
import { Point } from "./point";
import * as pointGraph from "./point-graph";
import * as pointSet from "./point-set";
import { CellBase } from "./types";
import {
  getFormulaComputedValue,
  isFormulaCell,
  transformCoordToPoint,
} from "./util";

export class Model<Cell extends CellBase> {
  readonly formulaParser = new hotFormulaParser.Parser();

  constructor(
    public readonly data: matrix.Matrix<Cell>,
    public readonly referenceGraph: pointGraph.PointGraph,
    public readonly evaluatedData: matrix.Matrix<Cell>
  ) {
    this.formulaParser.on("callCellValue", (cellCoord, done) => {
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
    this.formulaParser.on(
      "callRangeValue",
      (startCellCoord, endCellCoord, done) => {
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
      }
    );
  }
}

export function updateCellValue<Cell extends CellBase>(
  model: Model<Cell>,
  point: Point,
  cell: Cell
): Model<Cell> {
  if (!isFormulaCell(cell)) {
    return model;
  }
  const nextData = matrix.set(point, cell, model.data);
  const nextReferenceGraph = pointGraph.set(
    point,
    pointSet.from(getReferences(cell.value)),
    model.referenceGraph
  );
  const nextEvaluatedData = evaluateCell(
    model,
    nextData,
    nextReferenceGraph,
    point,
    cell
  );
  return new Model(nextData, nextReferenceGraph, nextEvaluatedData);
}

function evaluateCell<Cell extends CellBase>(
  prevModel: Model<Cell>,
  data: matrix.Matrix<Cell>,
  referenceGraph: pointGraph.PointGraph,
  point: Point,
  cell: Cell
): matrix.Matrix<Cell> {
  if (!isFormulaCell(cell)) {
    return prevModel.evaluatedData;
  }

  // for every formula cell that references the cell re-evaluate (recursive)
  // if the cell is a formula evaluate the formula

  let nextEvaluatedData = prevModel.evaluatedData;
  const referrers = pointGraph.getBackwards(point, referenceGraph);
  for (const referrer of pointSet.toArray(referrers)) {
    nextEvaluatedData = evaluateCell(
      prevModel,
      data,
      referenceGraph,
      referrer,
      cell
    );
  }
  const evaluatedValue = getFormulaComputedValue({
    cell,
    formulaParser: prevModel.formulaParser,
  });
  const evaluatedCell = { value: evaluatedValue } as Cell;

  nextEvaluatedData = matrix.set<Cell>(point, evaluatedCell, nextEvaluatedData);

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
      const references = getReferences(cell.value);
      entries.push([point, pointSet.from(references)]);
    }
  }
  return pointGraph.from(entries);
}
