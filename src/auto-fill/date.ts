/**
 * @module
 *
 * Date-related built-in list patterns for auto-fill.
 *
 * This module provides auto-fillers for common date-related lists:
 * - **Days of week**: "Monday" → "Tuesday" → "Wednesday"
 * - **Days of week (short)**: "Mon" → "Tue" → "Wed"
 * - **Months**: "January" → "February" → "March"
 * - **Months (short)**: "Jan" → "Feb" → "Mar"
 *
 * Features:
 * - **Wrapping**: Saturday → Sunday → Monday
 * - **Case preservation**: "MONDAY" → "TUESDAY", "monday" → "tuesday"
 *
 * @example
 * ["Monday", "Tuesday"] → "Wednesday", "Thursday", "Friday"...
 *
 * @example
 * ["JANUARY"] → "FEBRUARY", "MARCH", "APRIL"...
 */

import { AutoFiller, Series } from "./types";

// Built-in lists
const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const DAYS_OF_WEEK_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export type ListFactor = {
  list: string[];
  index: number;
  caseFormatter: (s: string) => string;
};

export type ListValue = {
  index: number;
};

/**
 * Determines the case formatter based on the input string
 */
function getCaseFormatter(
  input: string,
  reference: string
): (s: string) => string {
  // Check if all uppercase
  if (input === input.toUpperCase() && input !== input.toLowerCase()) {
    return (s: string) => s.toUpperCase();
  }
  // Check if all lowercase
  if (input === input.toLowerCase() && input !== input.toUpperCase()) {
    return (s: string) => s.toLowerCase();
  }
  // Otherwise preserve original case (title case or mixed)
  return (s: string) => s;
}

/**
 * Matches a series against a predefined list
 */
function matchListSeries(
  series: Series<string>,
  list: string[]
):
  | {
      list: string[];
      index: number;
      caseFormatter: (s: string) => string;
    }
  | undefined {
  if (series.length === 0) return;
  const firstItem = series.find((item) => item !== undefined);
  if (!firstItem || typeof firstItem.value !== "string") return;

  // Find the item in the list (case-insensitive)
  const normalizedList = list.map((item) => item.toLowerCase());
  const firstValue = String(firstItem.value);
  const firstValueLower = firstValue.toLowerCase();
  let startIndex = normalizedList.indexOf(firstValueLower);

  if (startIndex === -1) return;

  // Determine case formatter based on first value
  const caseFormatter = getCaseFormatter(firstValue, list[startIndex]);

  // For single cell, return the pattern
  if (series.filter((item) => item !== undefined).length === 1) {
    return { list, index: startIndex, caseFormatter };
  }

  // Verify pattern holds for all items (should increment through the list)
  let expectedIndex = startIndex;
  for (const item of series) {
    if (item === undefined) continue;
    const itemValueLower = String(item.value).toLowerCase();
    if (normalizedList[expectedIndex] !== itemValueLower) return;
    expectedIndex = (expectedIndex + 1) % list.length;
  }

  return { list, index: startIndex, caseFormatter };
}

/** Days of week (full names) */
export const daysOfWeek: AutoFiller<ListFactor, string> = {
  match: (series) => matchListSeries(series, DAYS_OF_WEEK),
  nextValue: (previousValue, matchDetails, _context) => {
    // Extract current index from the list
    const currentIndex = matchDetails.list.findIndex(
      (item) => item.toLowerCase() === String(previousValue).toLowerCase()
    );
    const nextIndex =
      currentIndex !== -1 ? (currentIndex + 1) % matchDetails.list.length : 0;
    const baseValue = matchDetails.list[nextIndex];
    return matchDetails.caseFormatter(baseValue);
  },
};

/** Days of week (short names) */
export const daysOfWeekShort: AutoFiller<ListFactor, string> = {
  match: (series) => matchListSeries(series, DAYS_OF_WEEK_SHORT),
  nextValue: (previousValue, matchDetails, _context) => {
    const currentIndex = matchDetails.list.findIndex(
      (item) => item.toLowerCase() === String(previousValue).toLowerCase()
    );
    const nextIndex =
      currentIndex !== -1 ? (currentIndex + 1) % matchDetails.list.length : 0;
    const baseValue = matchDetails.list[nextIndex];
    return matchDetails.caseFormatter(baseValue);
  },
};

/** Months (full names) */
export const months: AutoFiller<ListFactor, string> = {
  match: (series) => matchListSeries(series, MONTHS),
  nextValue: (previousValue, matchDetails, _context) => {
    const currentIndex = matchDetails.list.findIndex(
      (item) => item.toLowerCase() === String(previousValue).toLowerCase()
    );
    const nextIndex =
      currentIndex !== -1 ? (currentIndex + 1) % matchDetails.list.length : 0;
    const baseValue = matchDetails.list[nextIndex];
    return matchDetails.caseFormatter(baseValue);
  },
};

/** Months (short names) */
export const monthsShort: AutoFiller<ListFactor, string> = {
  match: (series) => matchListSeries(series, MONTHS_SHORT),
  nextValue: (previousValue, matchDetails, _context) => {
    const currentIndex = matchDetails.list.findIndex(
      (item) => item.toLowerCase() === String(previousValue).toLowerCase()
    );
    const nextIndex =
      currentIndex !== -1 ? (currentIndex + 1) % matchDetails.list.length : 0;
    const baseValue = matchDetails.list[nextIndex];
    return matchDetails.caseFormatter(baseValue);
  },
};

/**
 * Converts a ListValue with its match details to its display string
 */
export function formatList(value: ListValue, matchDetails: ListFactor): string {
  const baseValue = matchDetails.list[value.index];
  return matchDetails.caseFormatter
    ? matchDetails.caseFormatter(baseValue)
    : baseValue;
}

/**
 * Ordered list of date-related auto-fillers (days of week, months)
 */
export const dateAutoFillers: AutoFiller<any, any>[] = [
  daysOfWeek,
  daysOfWeekShort,
  months,
  monthsShort,
];
