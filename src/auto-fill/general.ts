/**
 * @module
 *
 * General/fallback patterns for auto-fill operations.
 *
 * This module provides the most general auto-fill patterns that match when more specific
 * patterns don't apply. Currently includes:
 * - **Repeating**: Copies identical values when all cells in the series are the same
 *
 * These auto-fillers should be checked last in the priority order since they match
 * very broad patterns.
 *
 * @example
 * ["Hello", "Hello"] → "Hello", "Hello", "Hello"...
 */

import { AutoFiller, Series } from "./types";

/**
 * Repeating/copying auto-filler - matches when all values are the same
 * This is the most general pattern and should be checked last
 * Requires at least one non-undefined value to match
 */
export const repeating: AutoFiller<any, any> = {
  match: (series) => {
    let curr: any | undefined;
    let hasValue = false;
    for (const item of series) {
      if (item === undefined) continue;
      if (curr === undefined) {
        curr = item?.value;
        hasValue = true;
      }
      if (item?.value !== curr) {
        return;
      }
    }
    return hasValue ? curr : undefined;
  },
  nextValue: (previousValue, _matchDetails, _context) => previousValue,
};

/**
 * Ordered list of general auto-fillers
 * These are the most general patterns and should be checked last
 */
export const generalAutoFillers: AutoFiller<any, any>[] = [repeating];
