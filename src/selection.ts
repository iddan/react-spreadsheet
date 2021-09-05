import * as PointRange from "./point-range";
import * as Point from "./point";
import * as Matrix from "./matrix";

export enum Direction {
  Left = "Left",
  Right = "Right",
  Top = "Top",
  Bottom = "Bottom",
}

/** Type entirely selected */
export enum EntireSelectionType {
  Row = "row",
  Column = "column",
  Table = "table",
}

export type EntireSelection = {
  type: EntireSelectionType;
};

/** Selection of entire rows */
export type EntireRowsSelection = EntireSelection & {
  type: EntireSelectionType.Row;
  /** Selection start index, integer */
  start: number;
  /** Selection end index, integer */
  end: number;
};

/** Selection of entire columns */
export type EntireColumnsSelection = EntireSelection & {
  type: EntireSelectionType.Column;
  /** Selection start index, integer */
  start: number;
  /** Selection end index, integer */
  end: number;
};

/** Selection of an entire table */
export type EntireTableSelection = EntireSelection & {
  type: EntireSelectionType.Table;
};

/** Selection from a spreadsheet */
export type Selection =
  | PointRange.PointRange
  | EntireRowsSelection
  | EntireColumnsSelection
  | EntireTableSelection
  | null;

/** Get concrete range in given data of given selection */
export function toRange(
  selection: Selection,
  data: Matrix.Matrix<unknown>
): PointRange.PointRange | null {
  if (selection === null) {
    return null;
  }
  if (PointRange.is(selection)) {
    return selection;
  }
  switch (selection.type) {
    case EntireSelectionType.Row: {
      const max = Matrix.maxPoint(data);
      return PointRange.create(
        { row: selection.start, column: 0 },
        { row: selection.end, column: max.column }
      );
    }
    case EntireSelectionType.Column: {
      const max = Matrix.maxPoint(data);
      return PointRange.create(
        { row: 0, column: selection.start },
        { row: max.row, column: selection.end }
      );
    }
    case EntireSelectionType.Table: {
      return getMatrixRange(data);
    }
  }
}

/** Get the number of points selected */
export function size(
  selection: Selection,
  data: Matrix.Matrix<unknown>
): number {
  const range = toRange(selection, data);
  return range ? PointRange.size(range) : 0;
}

/** Is the given point selected */
export function has(
  selection: Selection,
  data: Matrix.Matrix<unknown>,
  point: Point.Point
): boolean {
  const range = toRange(selection, data);
  return range !== null && PointRange.has(range, point);
}

/** Normalize given selection to given data matrix */
export function normalize(
  selection: Selection,
  data: Matrix.Matrix<unknown>
): Selection {
  if (!PointRange.is(selection)) {
    return selection;
  }
  return normalizeRange(selection, data);
}

/** Normalize given range to given data matrix */
export function normalizeRange(
  range: PointRange.PointRange,
  data: Matrix.Matrix<unknown>
): PointRange.PointRange {
  const dataRange = getMatrixRange(data);
  return PointRange.mask(range, dataRange);
}

/** Get selected points */
export function getPoints(
  selection: Selection,
  data: Matrix.Matrix<unknown>
): Point.Point[] {
  const range = toRange(selection, data);
  return range ? Array.from(PointRange.iterate(range)) : [];
}

/** Get given selection from given data */
export function getSelectionFromMatrix<T>(
  selection: Selection,
  data: Matrix.Matrix<T>
): Matrix.Matrix<T> {
  const range = toRange(selection, data);
  return range ? getRangeFromMatrix(range, data) : [];
}

/** Modify given edge of given selection according to given active point and data matrix */
export function modifyEdge(
  selection: Selection,
  active: Point.Point | null,
  data: Matrix.Matrix<unknown>,
  edge: Direction
): Selection {
  /* @todo support entire selections */
  if (!active || !PointRange.is(selection)) {
    return selection;
  }
  return modifyRangeEdge(selection, active, data, edge);
}

/** Modify given edge of given range according to given active point and data matrix */
export function modifyRangeEdge(
  range: PointRange.PointRange,
  active: Point.Point,
  data: Matrix.Matrix<unknown>,
  edge: Direction
): PointRange.PointRange {
  const field =
    edge === Direction.Left || edge === Direction.Right ? "column" : "row";

  const key =
    edge === Direction.Left || edge === Direction.Top ? "start" : "end";
  const delta = key === "start" ? -1 : 1;

  const edgeOffsets = PointRange.has(range, {
    ...active,
    [field]: active[field] + delta * -1,
  });

  const keyToModify = edgeOffsets ? (key === "start" ? "end" : "start") : key;

  const nextRange = {
    ...range,
    [keyToModify]: {
      ...range[keyToModify],
      [field]: range[keyToModify][field] + delta,
    },
  };

  return normalizeRange(nextRange, data);
}

/** Get the point range of given matrix */
export function getMatrixRange(
  data: Matrix.Matrix<unknown>
): PointRange.PointRange {
  const maxPoint = Matrix.maxPoint(data);
  return PointRange.create(Point.ORIGIN, maxPoint);
}

export function getRangeFromMatrix<T>(
  range: PointRange.PointRange,
  matrix: Matrix.Matrix<T>
): Matrix.Matrix<T> {
  return Matrix.slice(range.start, range.end, matrix);
}
