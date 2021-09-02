import * as Point from "./point";
import { extractLabel } from "hot-formula-parser";

export const PREFIX = "=";
const FORMULA_REFERENCES = /\$?[A-Z]+\$?[0-9]+/g;

/** Returns whether given value is a formula */
export function isFormula(value: unknown): value is string {
  return typeof value === "string" && value.startsWith(PREFIX);
}

/**
 * For given formula returns the cell references
 * @param formula - formula to get references for
 */
export function getReferences(formula: string): Point.Point[] {
  const match = formula.match(FORMULA_REFERENCES);
  return match
    ? match.map((substr) => {
        const [row, column] = extractLabel(substr);
        return { row: row.index, column: column.index };
      })
    : [];
}
