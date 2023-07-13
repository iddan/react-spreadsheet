import { PointRange } from "./point-range";
import * as Point from "./point";
import * as Matrix from "./matrix";

export enum Direction {
  Left = "Left",
  Right = "Right",
  Top = "Top",
  Bottom = "Bottom",
}

/** Selection from a spreadsheet */
export abstract class Selection {
  /** Get concrete range of the selection in the given data */
  abstract toRange(data: Matrix.Matrix<unknown>): PointRange | null;

  /** Normalize the selection according to the given data */
  abstract normalizeTo(data: Matrix.Matrix<unknown>): this;

  /** Modify given edge according to given active point and data */
  abstract modifyEdge(
    active: Point.Point,
    data: Matrix.Matrix<unknown>,
    edge: Direction
  ): this;

  /** Get the number of selected points according to given data */
  size(data: Matrix.Matrix<unknown>): number {
    const range = this.toRange(data);
    return range ? range.size() : 0;
  }

  /** Return whether the given point is within the selection */
  has(data: Matrix.Matrix<unknown>, point: Point.Point): boolean {
    const range = this.toRange(data);
    return range !== null && range.has(point);
  }

  getPoints(data: Matrix.Matrix<unknown>): Point.Point[] {
    const range = this.toRange(data);
    return range ? Array.from(range.iterate()) : [];
  }

  /** Return whether the given row is entirely selected in given selection */
  hasEntireRow(row: number): boolean {
    return false;
  }

  /** Return whether the given column is entirely selected in given selection */
  hasEntireColumn(column: number): boolean {
    return false;
  }

  /** Get given selection from given data */
  getFromMatrix<T>(data: Matrix.Matrix<T>): Matrix.Matrix<T> {
    const range = this.toRange(data);
    return range ? range.getFromMatrix(data) : [];
  }
}

export class EmptySelection extends Selection {
  toRange(data: Matrix.Matrix<unknown>): PointRange | null {
    return null;
  }
  normalizeTo(data: Matrix.Matrix<unknown>): this {
    return this;
  }
  modifyEdge(
    active: Point.Point,
    data: Matrix.Matrix<unknown>,
    edge: Direction
  ): this {
    return this;
  }
}

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

  modifyEdge(
    active: Point.Point,
    data: Matrix.Matrix<unknown>,
    edge: Direction
  ): this {
    const field =
      edge === Direction.Left || edge === Direction.Right ? "column" : "row";

    const key =
      edge === Direction.Left || edge === Direction.Top ? "start" : "end";
    const delta = key === "start" ? -1 : 1;

    const edgeOffsets = this.range.has({
      ...active,
      [field]: active[field] + delta * -1,
    });

    const keyToModify = edgeOffsets ? (key === "start" ? "end" : "start") : key;

    const nextRange = new PointRange(this.range.start, this.range.end);

    nextRange[keyToModify][field] += delta;

    const nextSelection = new RangeSelection(nextRange).normalizeTo(data);

    // @ts-expect-error
    return nextSelection;
  }
}

abstract class EntireSelection extends Selection {}

export class EntireTableSelection extends EntireSelection {
  toRange(data: Matrix.Matrix<unknown>): PointRange {
    return getMatrixRange(data);
  }
  modifyEdge(
    active: Point.Point,
    data: Matrix.Matrix<unknown>,
    edge: Direction
  ): this {
    return this;
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
}

export class EntireRowsSelection extends EntireSelection {
  /** Selection start index, integer */
  start: number;
  /** Selection end index, integer */
  end: number;

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

  modifyEdge(
    active: Point.Point,
    data: Matrix.Matrix<unknown>,
    edge: Direction
  ): this {
    if (edge === Direction.Left || edge === Direction.Right) {
      return this;
    }
    const delta = edge === Direction.Top ? -1 : 1;
    const property = edge === Direction.Top ? "start" : "end";
    const oppositeProperty = property === "start" ? "end" : "start";
    const nextSelection = new EntireRowsSelection(this.start, this.end);
    if (
      edge === Direction.Top ? this.end > active.row : this.start < active.row
    ) {
      nextSelection[oppositeProperty] = this[oppositeProperty] + delta;
    } else {
      nextSelection[property] = this[property] + delta;
    }
    // @ts-expect-error
    return nextSelection.normalizeTo(data);
  }
}

export class EntireColumnsSelection extends EntireSelection {
  /** Selection start index, integer */
  public start: number;
  /** Selection end index, integer */
  public end: number;

  /**
   * Creates entire columns selection
   * @param start - column index where the selection starts, integer
   * @param end - column index where the selection starts, integer
   */
  constructor(
    /** Selection start index, integer */
    start: number,
    /** Selection end index, integer */
    end: number
  ) {
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

  hasEntireColumn(column: number): boolean {
    return column >= this.start && column <= this.end;
  }

  modifyEdge(
    active: Point.Point,
    data: Matrix.Matrix<unknown>,
    edge: Direction
  ): this {
    if (edge === Direction.Top || edge === Direction.Bottom) {
      return this;
    }
    const delta = edge === Direction.Left ? -1 : 1;
    const property = edge === Direction.Left ? "start" : "end";
    const oppositeProperty = property === "start" ? "end" : "start";
    const nextSelection = new EntireColumnsSelection(this.start, this.end);
    if (
      edge === Direction.Left
        ? this.end > active.column
        : this.start < active.column
    ) {
      nextSelection[oppositeProperty] = this[oppositeProperty] + delta;
    } else {
      nextSelection[property] = this[property] + delta;
    }
    // @ts-expect-error
    return nextSelection.normalizeTo(data);
  }
}

/** Get the point range of given matrix */
export function getMatrixRange(data: Matrix.Matrix<unknown>): PointRange {
  const maxPoint = Matrix.maxPoint(data);
  return new PointRange(Point.ORIGIN, maxPoint);
}

/** Returns whether given value is a valid index */
export function isIndex(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

/** Error thrown when passing a non-index value where index is expected */
export class InvalidIndexError extends Error {
  constructor(name: string) {
    super(`${name} is not a valid index. It must be 0 or a positive integer`);
  }
}
