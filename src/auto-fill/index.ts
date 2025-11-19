/**
 * @module
 *
 * Auto-fill functionality for the spreadsheet with intelligent pattern detection.
 *
 * This module provides an Excel-style auto-fill system that detects patterns in selected
 * cells and automatically continues them when dragging the fill handle.
 *
 * ## Usage
 *
 * ```typescript
 * import { autoFillRange } from './auto-fill';
 *
 * const updatedData = autoFillRange(data, range);
 * ```
 *
 * ## Architecture
 *
 * - **auto-fill-range.ts** - Main orchestrator that applies auto-fillers
 *
 * The auto-fill system uses specialized auto-fillers:
 * - **numeric.ts** - Numeric sequences (1, 2, 3...)
 * - **text-with-number.ts** - Text with numbers (Task 1 → Task 2)
 * - **date.ts** - Days/months lists (Monday → Tuesday)
 * - **formula.ts** - Formula reference updating (=A1 → =A2)
 * - **general.ts** - Fallback patterns (repeating values)
 *
 * ## Adding New Auto-Fillers
 *
 * 1. Create an `AutoFiller` implementation in the appropriate module
 * 2. Add it to the module's exported array
 * 3. It will automatically be included in the priority chain
 *
 * @example
 * ```typescript
 * // Create custom auto-filler
 * export const myPattern: AutoFiller<MyFactor, MyValue> = {
 *   match: (series) => { ... },
 *   nextValue: (prev, factor, context) => { ... }
 * };
 *
 * // Add to module exports
 * export const myAutoFillers = [myPattern];
 * ```
 */

export { autoFillRange } from "./auto-fill-range";
export type { AutoFiller, Series } from "./types";
export * from "./numeric";
export * from "./text-with-number";
export * from "./date";
export * from "./formula";
export * from "./general";
