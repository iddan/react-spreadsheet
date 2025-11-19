/**
 * @module
 *
 * Core type definitions for the auto-fill system.
 */

import { CellBase } from "../types";
import { Point } from "../point";

/** A series of cells (may include undefined for empty cells) */
export type Series<T = any> = Array<CellBase<T> | undefined>;

/** Context provided to auto-filler operations */
export type AutoFillContext = {
  /** The target point being filled */
  point: Point;
  /** The starting point of the pattern */
  startPoint: Point;
  /** The index in the fill sequence (0-based from start) */
  index: number;
};

/** Auto-filler interface for pattern detection and value generation */
export type AutoFiller<TMatchDetails, TValue> = {
  /** Matches a series and returns match details/pattern descriptor, or undefined if no match */
  match: (series: Series) => TMatchDetails | undefined;
  /** Generates the next value given the previous value, the match details, and the context */
  nextValue: (
    previousValue: TValue,
    matchDetails: TMatchDetails,
    context: AutoFillContext
  ) => TValue;
};
