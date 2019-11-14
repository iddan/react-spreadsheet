import { extractLabel } from "hot-formula-parser/lib/helper/cell";

import * as Types from "./types";

function isFormulaCell<Cell extends { value?: string }>(cell: Cell): boolean {
  return Boolean(
    cell &&
      cell.value &&
      typeof cell.value === "string" &&
      cell.value.startsWith("=")
  );
}

const FORMULA_CELL_REFERENCES = /\$?[A-Z]+\$?[0-9]+/g;

/** @todo move me */
export function getBindingsForCell<Cell>(cell: Cell): Types.IPoint[] {
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
  return match.map((substr: string) => {
    const [row, column] = extractLabel(substr);
    return { row: row.index, column: column.index };
  }, {});
}
