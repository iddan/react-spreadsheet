// @flow
import * as Types from "./types";
import { type Matrix } from "./matrix"
import cellHelper from "hot-formula-parser/lib/helper/cell";

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
export function getBindingsForCell<T, Cell: { value: T }>(
  cell: Cell,
  getCell: (row: number, column: number, data: Matrix<T>) => T,
  data: Matrix<T>
): Types.Point[] {
  if (!isFormulaCell(cell)) {
    return [];
  }
  const { value } = cell;
  if (typeof value !== "string") {
    return [];
  }
  // Get raw cell references from formula
  const match = value.match(FORMULA_CELL_REFERENCES);
  if (!match) {
    return [];
  }
  // Normalize references to points
  return match
    .map((substr) => {
      const [row, column] = cellHelper.extractLabel(substr);
      const bindingsForDependentCell = getBindingsForCell(
        // $FlowFixMe
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
