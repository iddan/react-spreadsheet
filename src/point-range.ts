/**
 * Interface for ranges between two points
 */

import { Point } from "./types";

/** Range between two points */
export type PointRange = {
  /** The top-left point */
  start: Point;
  /** The bottom-right point */
  end: Point;
};

/** Creates a normalized range between two given points */
export function create(source: Point, target: Point): PointRange {
  return {
    start: {
      row: Math.min(source.row, target.row),
      column: Math.min(source.column, target.column),
    },
    end: {
      row: Math.max(source.row, target.row),
      column: Math.max(source.column, target.column),
    },
  };
}

/** Iterates through all the existing points in given range */
export function* iterate(range: PointRange): Iterable<Point> {
  for (let row = range.start.row; row <= range.end.row; row++) {
    for (
      let column = range.start.column;
      column <= range.end.column;
      column++
    ) {
      yield { row, column };
    }
  }
}

/** Returns the size (rows x columns) of the given range */
export function size(range: PointRange): number {
  const rows = range.end.row + 1 - range.start.row;
  const columns = range.end.column + 1 - range.start.column;
  return rows * columns;
}

/** Returns whether given point exists in given range */
export function has(range: PointRange, point: Point): boolean {
  return (
    point.row >= range.start.row &&
    point.column >= range.start.column &&
    point.row <= range.end.row &&
    point.column <= range.end.column
  );
}

/** Limits given masked range with given mask */
export function mask(masked: PointRange, mask: PointRange): PointRange {
  return {
    start: {
      row:
        mask.start.row > masked.start.row ? mask.start.row : masked.start.row,
      column:
        mask.start.column > masked.start.column
          ? mask.start.column
          : masked.start.column,
    },
    end: {
      row: mask.end.row < masked.end.row ? mask.end.row : masked.end.row,
      column:
        mask.end.column < masked.end.column
          ? mask.end.column
          : masked.end.column,
    },
  };
}
