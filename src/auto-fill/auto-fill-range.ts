/**
 * @module
 *
 * Main orchestrator for the auto-fill system.
 *
 * This module brings together all auto-fillers and applies them to ranges.
 * When auto-fill is triggered, it:
 *
 * 1. **Extracts the series**: Reads values from the selected range
 * 2. **Finds a matching pattern**: Tries each auto-filler in priority order
 * 3. **Generates values**: Uses the matched auto-filler to fill empty cells
 *
 * ## Auto-Filler Priority Order
 *
 * More specific patterns are checked before general ones to avoid false matches:
 *
 * 1. **Formulas** - Check first to avoid being matched as "repeating"
 * 2. **Numeric patterns** - Increasing/decreasing sequences
 * 3. **Text with numbers** - "Task 1", "Task 2"...
 * 4. **Date lists** - Days of week, months
 * 5. **General** - Repeating values (fallback)
 *
 * @example
 * ```typescript
 * const data = [
 *   [{ value: 1 }, { value: 2 }],
 *   [{ value: undefined }, { value: undefined }]
 * ];
 * const range = new PointRange({row: 0, column: 0}, {row: 3, column: 0});
 * const result = autoFillRange(data, range);
 * // result will have cells filled: 1, 2, 3, 4
 * ```
 */

import * as matrix from "../matrix";
import { PointRange } from "../point-range";
import { CellBase } from "../types";
import { AutoFiller } from "./types";
import { numericAutoFillers } from "./numeric";
import { textAutoFillers } from "./text-with-number";
import { dateAutoFillers } from "./date";
import { formulaAutoFillers } from "./formula";
import { generalAutoFillers } from "./general";

/**
 * Registry of all available auto-fillers
 * Order matters: more specific patterns should come before more general ones
 */
const autoFillers: AutoFiller<any, any>[] = [
  ...formulaAutoFillers, // Formula patterns (check first to avoid repeating match)
  ...numericAutoFillers, // Numeric patterns (increasing, decreasing)
  ...textAutoFillers, // Text with numbers (Task 1, Task 2, etc.)
  ...dateAutoFillers, // Days of week and months
  ...generalAutoFillers, // Repeating/copying (most general, check last)
];

/**
 * Auto-fills a range based on detected patterns in the existing data
 * @param data - The spreadsheet data matrix
 * @param range - The range to auto-fill
 * @returns Updated data matrix with auto-filled values
 */
export function autoFillRange<T>(
  data: matrix.Matrix<CellBase<T>>,
  range: PointRange
): matrix.Matrix<CellBase<T>> {
  const series = Array.from(range, (point) => matrix.get(point, data));
  const autoFiller = autoFillers.find((it) => it.match(series));
  if (!autoFiller) return data;
  const matchDetails = autoFiller?.match(series);

  // Find the first non-empty cell in the series (for formulas, we start from the first)
  let firstFilledIndex = -1;
  for (let i = 0; i < series.length; i++) {
    if (series[i] !== undefined) {
      firstFilledIndex = i;
      break;
    }
  }

  // Find the last non-empty cell in the series
  let lastFilledIndex = -1;
  for (let i = series.length - 1; i >= 0; i--) {
    if (series[i] !== undefined) {
      lastFilledIndex = i;
      break;
    }
  }

  if (lastFilledIndex === -1) return data;

  const points = Array.from(range);

  // Start from the last filled cell's value
  let currentValue: any = series[lastFilledIndex]?.value;

  let updatedData = data;

  // Fill only cells after the last filled cell
  for (let i = lastFilledIndex + 1; i < points.length; i++) {
    const point = points[i];
    const startPoint = points[firstFilledIndex];
    const index = i - lastFilledIndex - 1;

    const context = { point, startPoint, index };

    // Auto-filler returns the final display value
    const nextValue = autoFiller.nextValue(currentValue, matchDetails, context);
    currentValue = nextValue;

    const currentCell = matrix.get(point, updatedData);
    const nextCell = currentCell
      ? { ...currentCell, value: nextValue }
      : ({ value: nextValue } as CellBase<T>);
    updatedData = matrix.set(point, nextCell, updatedData);
  }
  return updatedData;
}
