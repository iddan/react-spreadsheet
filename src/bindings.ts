import flatMap from "array.prototype.flatmap";
import * as Types from "./types";
import * as Matrix from "./matrix";
import { extractLabel } from "hot-formula-parser/lib/helper/cell";

const FORMULA_REFERENCES = /\$?[A-Z]+\$?[0-9]+/g;

export function isFormula(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("=");
}

export function getFormula<Cell extends Types.CellBase>(
  cell: Cell
): string | null {
  if (cell && cell.value && isFormula(cell.value)) {
    return cell.value;
  }
  return null;
}

/**
 * For given formula returns the cell references
 * @param formula
 */
export function getReferences(formula: string): Types.Point[] {
  const match = formula.match(FORMULA_REFERENCES);
  return match
    ? match.map((substr) => {
        const [row, column] = extractLabel(substr);
        return { row: row.index, column: column.index };
      })
    : [];
}

/**
 * For given cell and spreadsheet data returns the cells affecting the cell value
 * @param cell cell to get bindings for
 * @param data spreadsheet data the cell relates to
 * @returns an array of coordinates in the given spreadsheet data of the cells that affect the given cell
 */
export function getBindingsForCell<
  Value,
  Cell extends Types.CellBase & {
    value: Value;
  }
>(cell: Cell, data: Matrix.Matrix<Cell>): Types.Point[] {
  const formula = getFormula(cell);
  if (!formula) {
    return [];
  }
  const references = getReferences(formula);
  // Recursively get references to dependencies
  return flatMap(references, (coords) => {
    const dependency = Matrix.get(coords.row, coords.column, data);
    const dependencyBindings = dependency
      ? getBindingsForCell(dependency, data)
      : [];
    return [coords, ...dependencyBindings];
  });
}
