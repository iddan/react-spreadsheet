import { extractLabel } from "hot-formula-parser";
import * as pointSet from "./point-set";

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
export function getReferences(formula: string): pointSet.PointSet {
  const match = formula.match(FORMULA_REFERENCES);
  return match
    ? pointSet.from(
        match.map((substr) => {
          const [row, column] = extractLabel(substr);
          return { row: row.index, column: column.index };
        })
      )
    : [];
}
