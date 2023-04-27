/**
 * @module
 *
 * Text with numeric suffix pattern detection.
 *
 * This module detects and increments text strings that end with numbers:
 * - **Simple**: "Task 1" → "Task 2" → "Task 3"
 * - **Zero-padded**: "Item 001" → "Item 002" → "Item 003"
 *
 * The padding is preserved when incrementing. Only numbers at the end of strings
 * are supported (e.g., "Task 1" works, but "1 Task" does not).
 *
 * @example
 * ["Task 1", "Task 2"] → "Task 3", "Task 4", "Task 5"...
 *
 * @example
 * ["Item 001"] → "Item 002", "Item 003", "Item 004"...
 */

import { AutoFiller, Series } from "./types";

export type TextWithNumberFactor = {
  prefix: string;
  number: number;
  padding: number;
};

/**
 * Text with numeric suffix incrementing (e.g., "Task 1" -> "Task 2")
 * Supports zero-padded numbers (e.g., "Item 001" -> "Item 002")
 */
export const textWithNumber: AutoFiller<TextWithNumberFactor, string> = {
  match: (series) => {
    if (series.length === 0) return;
    const firstItem = series.find((item) => item !== undefined);
    if (!firstItem || typeof firstItem.value !== "string") return;

    const match = String(firstItem.value).match(/^(.*?)(\d+)(.*)$/);
    if (!match) return;

    const [, prefix, numberStr, suffix] = match;
    // Only handle cases where number is at the end (suffix is empty)
    if (suffix !== "") return;

    const startNumber = parseInt(numberStr, 10);
    const padding = numberStr.length;
    const step = 1;

    // For single cell, just return the pattern
    if (series.filter((item) => item !== undefined).length === 1) {
      return { prefix, number: startNumber, padding };
    }

    // Verify pattern holds for all items
    let expectedNumber = startNumber;
    for (const item of series) {
      if (item === undefined) continue;
      const itemMatch = String(item.value).match(/^(.*?)(\d+)(.*)$/);
      if (!itemMatch) return;
      const [, itemPrefix, itemNumberStr, itemSuffix] = itemMatch;
      if (itemSuffix !== "") return;
      const itemNumber = parseInt(itemNumberStr, 10);
      if (itemPrefix !== prefix || itemNumber !== expectedNumber) return;
      expectedNumber += step;
    }

    return { prefix, number: startNumber, padding };
  },
  nextValue: (previousValue, matchDetails, _context) => {
    // Extract number from previous value if it's a string
    const currentNumber =
      typeof previousValue === "string"
        ? parseInt(previousValue.match(/\d+/)?.[0] || "0", 10)
        : 0;

    const nextNumber = currentNumber + 1;
    const paddedNumber = String(nextNumber).padStart(matchDetails.padding, "0");
    return `${matchDetails.prefix}${paddedNumber}`;
  },
};

/**
 * Converts a TextWithNumberFactor to its display string
 */
export function formatTextWithNumber(factor: TextWithNumberFactor): string {
  const numStr = String(factor.number).padStart(factor.padding || 0, "0");
  return `${factor.prefix}${numStr}`;
}

/**
 * Ordered list of text-with-number auto-fillers
 */
export const textAutoFillers: AutoFiller<any, any>[] = [textWithNumber];
