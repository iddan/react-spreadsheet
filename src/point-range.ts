/**
 * Interface for ranges between two points
 */

import * as Point from "./point";

/** Range between two points. Creates a normalized range between two given points */
export class PointRange {
  /** The top-left point */
  start: Point.Point;
  /** The bottom-right point */
  end: Point.Point;

  constructor(source: Point.Point, target: Point.Point) {
    this.start = {
      row: Math.min(source.row, target.row),
      column: Math.min(source.column, target.column),
    };
    this.end = {
      row: Math.max(source.row, target.row),
      column: Math.max(source.column, target.column),
    };
  }

  /** Iterates through all the existing points in given range */
  *[Symbol.iterator](): Iterator<Point.Point> {
    for (let row = this.start.row; row <= this.end.row; row++) {
      for (
        let column = this.start.column;
        column <= this.end.column;
        column++
      ) {
        yield { row, column };
      }
    }
  }

  /** Returns the size (rows x columns) of the given range */
  size(): number {
    const rows = this.end.row + 1 - this.start.row;
    const columns = this.end.column + 1 - this.start.column;
    return rows * columns;
  }

  /** Returns whether given point exists in given range */
  has(point: Point.Point): boolean {
    return (
      point.row >= this.start.row &&
      point.column >= this.start.column &&
      point.row <= this.end.row &&
      point.column <= this.end.column
    );
  }

  /** Limits given masked range with given mask */
  mask(mask: PointRange): PointRange {
    return new PointRange(
      {
        row: mask.start.row > this.start.row ? mask.start.row : this.start.row,
        column:
          mask.start.column > this.start.column
            ? mask.start.column
            : this.start.column,
      },
      {
        row: mask.end.row < this.end.row ? mask.end.row : this.end.row,
        column:
          mask.end.column < this.end.column ? mask.end.column : this.end.column,
      }
    );
  }
}
