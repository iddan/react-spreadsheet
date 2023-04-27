/**
 * @module
 *
 * Numeric pattern detection for auto-fill operations.
 *
 * This module detects and continues numeric sequences with consistent steps:
 * - **Increasing**: 1, 2, 3... or 1.5, 2.5, 3.5...
 * - **Decreasing**: 10, 5, 0... or 100, 90, 80...
 *
 * Multiplicative patterns (×2, ÷2) are disabled as they can conflict with additive patterns.
 * For example, the series [1, 2] could be either +1 or ×2.
 *
 * @example
 * // Increasing by 1
 * [1, 2, 3] → 4, 5, 6...
 *
 * @example
 * // Decreasing by 5
 * [10, 5, 0] → -5, -10, -15...
 */

import { AutoFiller, Series } from "./types";

/**
 * Checks if a series contains only numeric values and has at least one non-undefined numeric item
 */
function isNumberSeries(series: Series): series is Series<number> {
  let hasNumericValue = false;
  const allNumericOrUndefined = series.every((item) => {
    const isNumeric =
      item && item.value !== undefined && !isNaN(Number(item.value));
    if (isNumeric) {
      hasNumericValue = true;
    }
    return !item || item.value === undefined || isNumeric;
  });
  return allNumericOrUndefined && hasNumericValue;
}

/**
 * Matches a numeric series with a consistent pattern defined by the condition function
 */
function matchNumberSeries(
  series: Series<number>,
  condition: (a: number, b: number) => number
): number | undefined {
  if (!isNumberSeries(series)) {
    return;
  }
  let curr: number | undefined = undefined;
  for (const [index, item] of series.entries()) {
    const nextItem = series[index + 1];
    if (item === undefined) continue;
    if (nextItem === undefined) continue;
    const nextResult = condition(Number(item.value), Number(nextItem.value));
    if (!isFinite(nextResult)) return;
    if (!curr) {
      curr = nextResult;
      continue;
    }
    if (curr !== nextResult) {
      return;
    }
  }
  return curr;
}

/** Increasing numeric series (e.g., 1, 2, 3...) */
export const increasing: AutoFiller<number, number> = {
  match: (series) => matchNumberSeries(series, (a, b) => b - a),
  nextValue: (previousValue, matchDetails, _context) =>
    Number(previousValue) + matchDetails,
};

/** Decreasing numeric series (e.g., 10, 5, 0...) */
export const decreasing: AutoFiller<number, number> = {
  match: (series) => matchNumberSeries(series, (a, b) => a - b),
  nextValue: (previousValue, matchDetails, _context) =>
    Number(previousValue) - matchDetails,
};

/** Multiplying numeric series (e.g., 2, 4, 8...) */
export const multiplying: AutoFiller<number, number> = {
  match: (series) => matchNumberSeries(series, (a, b) => b / a),
  nextValue: (previousValue, matchDetails, _context) =>
    Number(previousValue) * matchDetails,
};

/** Dividing numeric series (e.g., 100, 50, 25...) */
export const dividing: AutoFiller<number, number> = {
  match: (series) => matchNumberSeries(series, (a, b) => a / b),
  nextValue: (previousValue, matchDetails, _context) =>
    Number(previousValue) / matchDetails,
};

/**
 * Ordered list of numeric auto-fillers
 * Note: multiplicative patterns are commented out as they can conflict with additive patterns
 */
export const numericAutoFillers: AutoFiller<any, any>[] = [
  increasing,
  decreasing,
  // multiplying,  // Disabled: can conflict with additive patterns like 1,2 vs 2,4
  // dividing,     // Disabled: can conflict with additive patterns
];
