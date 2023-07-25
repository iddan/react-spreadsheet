import { PointRange } from "./point-range";
import * as Point from "./point";
import * as Matrix from "./matrix";

/** Selection from a spreadsheet */
export abstract class Selection {
  /** Get concrete range of the selection in the given data */
  abstract toRange(data: Matrix.Matrix<unknown>): PointRange | null;

  /** Normalize the selection according to the given data */
  abstract normalizeTo(data: Matrix.Matrix<unknown>): this;

  /** Determines whether the given row is entirely selected in given selection */
  abstract hasEntireRow(row: number): boolean;

  /** Determines whether the given column is entirely selected in given selection */
  abstract hasEntireColumn(column: number): boolean;

  /** Get the number of selected points according to given data */
  abstract size(data: Matrix.Matrix<unknown>): number;

  /** Determines whether the given point is within the selection */
  abstract has(data: Matrix.Matrix<unknown>, point: Point.Point): boolean;
}

/** Selection of no cells */
export class EmptySelection extends Selection {
  toRange(data: Matrix.Matrix<unknown>): PointRange | null {
    return null;
  }
  normalizeTo(data: Matrix.Matrix<unknown>): this {
    return this;
  }
  hasEntireRow(row: number): boolean {
    return false;
  }
  hasEntireColumn(column: number): boolean {
    return false;
  }
  size(): number {
    return 0;
  }
  has(): boolean {
    return false;
  }
}

/** Selection of a range of cells */
export class RangeSelection extends Selection {
  constructor(public range: PointRange) {
    super();
  }

  toRange(data: Matrix.Matrix<unknown>): PointRange | null {
    return this.range;
  }

  normalizeTo(data: Matrix.Matrix<unknown>): this {
    const dataRange = getMatrixRange(data);
    const nextSelection = new RangeSelection(this.range.mask(dataRange));
    // @ts-expect-error
    return nextSelection;
  }

  hasEntireRow(row: number): boolean {
    return false;
  }

  hasEntireColumn(column: number): boolean {
    return false;
  }

  size(data: Matrix.Matrix<unknown>): number {
    const range = this.toRange(data);
    return range ? range.size() : 0;
  }

  has(data: Matrix.Matrix<unknown>, point: Point.Point): boolean {
    const range = this.toRange(data);
    return range !== null && range.has(point);
  }
}

/** Selection of an entire part of the spreadsheet */
abstract class EntireSelection extends Selection {}

/** Selection of the entire table */
export class EntireTableSelection extends EntireSelection {
  toRange(data: Matrix.Matrix<unknown>): PointRange {
    return getMatrixRange(data);
  }

  normalizeTo(data: Matrix.Matrix<unknown>): this {
    return this;
  }

  hasEntireColumn(column: number): boolean {
    return true;
  }

  hasEntireRow(row: number): boolean {
    return true;
  }

  size(data: Matrix.Matrix<unknown>): number {
    return Matrix.getColumnsCount(data) * Matrix.getRowsCount(data);
  }

  has(data: Matrix.Matrix<unknown>, point: Point.Point): boolean {
    return true;
  }
}

/** Selection of an entire axis in the spreadsheet */
export abstract class EntireAxisSelection extends EntireSelection {
  /** Selection start index, integer */
  readonly start: number;
  /** Selection end index, integer */
  readonly end: number;

  /**
   * @param start - row index where the selection starts, integer
   * @param end - row index where the selection ends, integer
   * @throws {@link InvalidIndexError}
   */
  constructor(start: number, end: number) {
    if (!isIndex(start)) {
      throw new InvalidIndexError("start");
    }
    if (!isIndex(end)) {
      throw new InvalidIndexError("end");
    }
    super();
    this.start = Math.min(start, end);
    this.end = Math.max(start, end);
  }

  /** Immutably set given property with given value */
  set(property: "start" | "end", value: number): this {
    if (!isIndex(value)) {
      throw new InvalidIndexError(property);
    }
    const { start, end } = this;
    const data = { start, end };
    data[property] = value;
    // @ts-expect-error
    return new this.constructor(data.start, data.end);
  }
}

/** Selection of entire rows in the spreadsheet */
export class EntireRowsSelection extends EntireAxisSelection {
  toRange(data: Matrix.Matrix<unknown>): PointRange {
    const max = Matrix.maxPoint(data);
    return new PointRange(
      { row: this.start, column: 0 },
      { row: this.end, column: max.column }
    );
  }

  normalizeTo(data: Matrix.Matrix<unknown>): this {
    const count = Matrix.getRowsCount(data);
    const nextSelection = new EntireRowsSelection(
      Math.max(this.start, 0),
      Math.min(this.end, count - 1)
    );
    // @ts-expect-error
    return nextSelection;
  }

  hasEntireRow(row: number): boolean {
    return row >= this.start && row <= this.end;
  }

  hasEntireColumn(column: number): boolean {
    return false;
  }

  size(data: Matrix.Matrix<unknown>): number {
    const rows = this.end - this.start + 1;
    return rows * Matrix.getColumnsCount(data);
  }

  has(data: Matrix.Matrix<unknown>, point: Point.Point): boolean {
    return point.row >= this.start && point.row <= this.end;
  }
}

/** Selection of entire columns in the spreadsheet */
export class EntireColumnsSelection extends EntireAxisSelection {
  toRange(data: Matrix.Matrix<unknown>): PointRange {
    const max = Matrix.maxPoint(data);
    return new PointRange(
      { row: 0, column: this.start },
      { row: max.row, column: this.end }
    );
  }

  normalizeTo(data: Matrix.Matrix<unknown>): this {
    const count = Matrix.getColumnsCount(data);
    const nextSelection = new EntireColumnsSelection(
      Math.max(this.start, 0),
      Math.min(this.end, count - 1)
    );
    // @ts-expect-error
    return nextSelection;
  }

  hasEntireRow(row: number): boolean {
    return false;
  }

  hasEntireColumn(column: number): boolean {
    return column >= this.start && column <= this.end;
  }

  size(data: Matrix.Matrix<unknown>): number {
    const columns = this.end - this.start + 1;
    return columns * Matrix.getRowsCount(data);
  }

  has(data: Matrix.Matrix<unknown>, point: Point.Point): boolean {
    return point.column >= this.start && point.column <= this.end;
  }
}

/** Get the point range of given matrix */
export function getMatrixRange(data: Matrix.Matrix<unknown>): PointRange {
  const maxPoint = Matrix.maxPoint(data);
  return new PointRange(Point.ORIGIN, maxPoint);
}

/** Determines whether the given value is a valid index */
export function isIndex(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

/** Error thrown when passing a non-index value where an index value is expected */
export class InvalidIndexError extends Error {
  constructor(name: string) {
    super(`${name} is not a valid index. It must be 0 or a positive integer`);
  }
}
