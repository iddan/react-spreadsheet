import flatMap from "array.prototype.flatmap";
import * as Types from "./types";
import * as Matrix from "./matrix";
import { isFormulaValue, getReferences } from "./formula";

/**
 * For given cell and spreadsheet data returns the cells affecting the cell value
 * @param cell - cell to get bindings for
 * @param data - spreadsheet data the cell relates to
 * @returns an array of coordinates in the given spreadsheet data of the cells that affect the given cell
 */
export const getBindingsForCell: Types.GetBindingsForCell = (cell, data) => {
  if (!isFormulaValue(cell.value)) {
    return [];
  }
  const formula = cell.value;
  const references = getReferences(formula);
  // Recursively get references to dependencies
  return flatMap(references, (coords) => {
    const dependency = Matrix.get(coords, data);
    const dependencyBindings = dependency
      ? getBindingsForCell(dependency, data)
      : [];
    return [coords, ...dependencyBindings];
  });
};
