import * as Point from "./point";
import { extractLabel } from "hot-formula-parser";

export const FORMULA_VALUE_PREFIX = "=";
const FORMULA_REFERENCES = /\$?[A-Z]+\$?[0-9]+/g;

/** Returns whether given value is a formula */
export function isFormulaValue(value: unknown): value is string {
  return typeof value === "string" && value.startsWith(FORMULA_VALUE_PREFIX);
}

/** Extracts formula from value  */
export function extractFormula(value: string): string {
  return value.slice(1);
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
