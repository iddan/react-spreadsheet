/**
 * @module
 *
 * Formula pattern detection with cell reference updating.
 *
 * This module handles auto-filling formulas while intelligently updating cell references:
 * - **Relative references**: `=A1` → `=A2` (filling down), `=A1` → `=B1` (filling right)
 * - **Absolute references**: `=$A$1` remains `=$A$1` in all directions
 * - **Mixed references**: `=$A1` (absolute column), `=A$1` (absolute row)
 * - **Range references**: `=SUM(A1:A3)` → `=SUM(A2:A4)`
 * - **Complex formulas**: Works with any function (IF, VLOOKUP, nested, etc.)
 *
 * The module uses regex to parse cell references and respects the `$` symbol
 * for absolute positioning.
 *
 * @example
 * // Relative reference filling down
 * ["=A1", "=A2"] → "=A3", "=A4", "=A5"...
 *
 * @example
 * // Mixed reference with absolute column
 * ["=$A$1+B1"] → "=$A$1+B2", "=$A$1+B3"...
 *
 * @example
 * // Range reference
 * ["=SUM(A1:A3)"] → "=SUM(A2:A4)", "=SUM(A3:A5)"...
 */

import { AutoFiller } from "./types";
import { isFormulaValue, extractFormula } from "../engine/formula";

/**
 * Updates cell references in a formula based on offset from the starting point
 */
function updateFormulaReferences(
  formula: string,
  rowOffset: number,
  colOffset: number
): string {
  // Match cell references like A1, $A1, A$1, $A$1, and ranges like A1:B2
  return formula.replace(
    /(\$?)([A-Z]+)(\$?)(\d+)(?::(\$?)([A-Z]+)(\$?)(\d+))?/g,
    (match, colAbs1, col1, rowAbs1, row1, colAbs2, col2, rowAbs2, row2) => {
      // Handle first cell reference
      let newCol1 = col1;
      let newRow1 = parseInt(row1, 10);

      // Update column if not absolute
      if (!colAbs1) {
        const colNum = columnToNumber(col1);
        const newColNum = colNum + colOffset;
        if (newColNum >= 0) {
          newCol1 = numberToColumn(newColNum);
        }
      }

      // Update row if not absolute
      if (!rowAbs1) {
        newRow1 += rowOffset;
        if (newRow1 < 1) newRow1 = 1;
      }

      let result = `${colAbs1}${newCol1}${rowAbs1}${newRow1}`;

      // Handle range reference if present
      if (col2 && row2) {
        let newCol2 = col2;
        let newRow2 = parseInt(row2, 10);

        // Update second column if not absolute
        if (!colAbs2) {
          const colNum = columnToNumber(col2);
          const newColNum = colNum + colOffset;
          if (newColNum >= 0) {
            newCol2 = numberToColumn(newColNum);
          }
        }

        // Update second row if not absolute
        if (!rowAbs2) {
          newRow2 += rowOffset;
          if (newRow2 < 1) newRow2 = 1;
        }

        result += `:${colAbs2}${newCol2}${rowAbs2}${newRow2}`;
      }

      return result;
    }
  );
}

/**
 * Converts column letter(s) to a number (A=0, B=1, ..., Z=25, AA=26, etc.)
 */
function columnToNumber(col: string): number {
  let result = 0;
  for (let i = 0; i < col.length; i++) {
    result = result * 26 + (col.charCodeAt(i) - 65 + 1);
  }
  return result - 1; // Make it 0-indexed
}

/**
 * Converts a number to column letter(s) (0=A, 1=B, ..., 25=Z, 26=AA, etc.)
 */
function numberToColumn(num: number): string {
  let result = "";
  num = num + 1; // Make it 1-indexed for the calculation
  while (num > 0) {
    const remainder = (num - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    num = Math.floor((num - 1) / 26);
  }
  return result;
}

/**
 * Formula auto-filler that handles relative and absolute cell references
 */
export const formula: AutoFiller<string, string> = {
  match: (series) => {
    if (series.length === 0) return;
    const firstItem = series.find((item) => item !== undefined);
    if (!firstItem || !isFormulaValue(firstItem.value)) return;

    const formulaText = extractFormula(String(firstItem.value));

    // Return just the formula text as the factor
    return formulaText;
  },
  nextValue: (_previousValue, matchDetails, context) => {
    // matchDetails is the original formula string from match()
    // context contains the target point and start point
    const formulaText = matchDetails;
    const rowOffset = context.point.row - context.startPoint.row;
    const colOffset = context.point.column - context.startPoint.column;

    const updatedFormula = updateFormulaReferences(
      formulaText,
      rowOffset,
      colOffset
    );

    return `=${updatedFormula}`;
  },
};

/**
 * Ordered list of formula auto-fillers
 */
export const formulaAutoFillers: AutoFiller<any, any>[] = [formula];
