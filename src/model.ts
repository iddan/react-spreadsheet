/**
 * The logic for updating the model of the spreadsheet
 * @module
 */

// Requirements:
// 1. when updating a cell that another cell is dependent on the dependent cell should be updated
// 2. cells should only be calculated when their value or one of their dependencies change

// Open Questions:
// 1. Should bindings be computed flat or recursive?

import * as Types from "./types";
import * as Matrix from "./matrix";
import { Point } from "./point";
import * as Bindings from "./bindings";

/** @todo move to types */
type EvaluateCell = <CellType extends Types.CellBase>(
  cell: CellType,
  data: Matrix.Matrix<CellType>
) => CellType;

export type Model<CellType> = {
  /** The raw cells data */
  data: Matrix.Matrix<CellType>;
  /** The evaluated cells data */
  evaluatedData: Matrix.Matrix<CellType>;
  /** The bindings between the cells */
  bindings: Bindings.Bindings;
};

/** Create model from given data */
export function create<CellType>(
  data: Matrix.Matrix<CellType>
): Model<CellType> {
  return {
    data,
    /** @todo evaluate cells */
    evaluatedData: data,
    /** @todo calculate all bindings */
    bindings: Bindings.create(),
  };
}

/**
 * Update given cell in the given model
 * @param model - the model to update the cell in
 * @param getBindingsForCell - a function that returns the cells that the cell depend on
 * @param evaluateCell - a function that evaluates the value of the cell (based on past calculations)
 * @param point - the coordinates of the cell
 * @param cell - the cell's updated data
 * @returns updated data, updated evaluated data and updated bindings
 */
export function updateCellValue<CellType extends Types.CellBase>(
  model: Model<CellType>,
  getBindingsForCell: Types.GetBindingsForCell,
  evaluateCell: EvaluateCell,
  point: Point,
  cell: CellType
): Model<CellType> {
  const evaluatedCell = evaluateCell(cell, data);
  const updatedCellBindings = getBindingsForCell(cell, data);
  const updatedData = Matrix.set(point, cell, data);
  const updatedEvaluatedData = Matrix.set(point, evaluatedCell, evaluatedData);
  const updatedBindings = Bindings.setDependencies(
    bindings,
    point,
    updatedCellBindings
  );
  const dependents = Bindings.getDependents(bindings, point);
  /** @todo update dependents */
  return {
    data: updatedData,
    evaluatedData: updatedEvaluatedData,
    bindings: updatedBindings,
  };
}

function updateEvaluatedDataWithCellValue<CellType extends Types.CellBase>(
  evaluatedData: Matrix.Matrix<CellType>,
  data: Matrix.Matrix<CellType>,
  getBindingsForCell: Types.GetBindingsForCell,
  evaluateCell: (cell: CellType, data: Matrix.Matrix<CellType>) => CellType,
  point: Point
) {}
