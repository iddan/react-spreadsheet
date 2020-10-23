// @flow
import * as Types from "./types";
import { extractLabel } from "hot-formula-parser/lib/helper/cell";

function isFormulaCell<Cell: ?{ value: any }>(cell: Cell): boolean {
  return Boolean(
    cell &&
      cell.value &&
      typeof cell.value === "string" &&
      cell.value.startsWith("=")
  );
}

const FORMULA_CELL_REFERENCES = /\$?[A-Z]+\$?[0-9]+/g;

/** @todo move me */
export function getBindingsForCell<Cell>(
  cell: Cell,
  getCell: (row: number, column: number, data: Matrix<T>) => T,
  data: Matrix<T>
): Types.Point[] {
  if (!isFormulaCell(cell)) {
    return [];
  }
  const { value } = cell;
  // Get raw cell references from formula
  const match = value.match(FORMULA_CELL_REFERENCES);
  if (!match) {
    return [];
  }
  // Normalize references to points
  return match
    .map((substr) => {
      const [row, column] = extractLabel(substr);
      const bindingsForDependentCell = getBindingsForCell(
        getCell(row.index, column.index, data),
        getCell,
        data
      );
      return [
        { row: row.index, column: column.index },
        ...bindingsForDependentCell,
      ];
    }, {})
    .flat();
}
