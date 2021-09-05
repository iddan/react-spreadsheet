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
export enum EntireType {
  Row = "row",
  Column = "column",
  Table = "table",
}

export type Entire = {
  type: EntireType;
};

/** Selection of entire rows */
export type EntireRows = Entire & {
  type: EntireType.Row;
  /** Selection start index, integer */
  start: number;
  /** Selection end index, integer */
  end: number;
};

/** Selection of entire columns */
export type EntireColumns = Entire & {
  type: EntireType.Column;
  /** Selection start index, integer */
  start: number;
  /** Selection end index, integer */
  end: number;
};

/** Selection of an entire table */
export type EntireTable = Entire & {
  type: EntireType.Table;
};

/** Selection from a spreadsheet */
export type Selection =
  | PointRange.PointRange
  | EntireRows
  | EntireColumns
  | EntireTable
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
    case EntireType.Row: {
      const max = Matrix.maxPoint(data);
      return PointRange.create(
        { row: selection.start, column: 0 },
        { row: selection.end, column: max.column }
      );
    }
    case EntireType.Column: {
      const max = Matrix.maxPoint(data);
      return PointRange.create(
        { row: 0, column: selection.start },
        { row: max.row, column: selection.end }
      );
    }
    case EntireType.Table: {
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
  if (selection) {
    if (PointRange.is(selection)) {
      return normalizeRange(selection, data);
    }
    switch (selection.type) {
      case EntireType.Row: {
        return normalizeEntireRows(selection, data);
      }
      case EntireType.Column: {
        return normalizeEntireColumns(selection, data);
      }
    }
  }
  return selection;
}

/** Normalize given range to given data matrix */
export function normalizeRange(
  range: PointRange.PointRange,
  data: Matrix.Matrix<unknown>
): PointRange.PointRange {
  const dataRange = getMatrixRange(data);
  return PointRange.mask(range, dataRange);
}

/** Normalize given entire rows selection to given data matrix */
export function normalizeEntireRows(
  selection: EntireRows,
  data: Matrix.Matrix<unknown>
): EntireRows {
  const count = Matrix.getRowsCount(data);
  return {
    type: EntireType.Row,
    start: Math.max(selection.start, 0),
    end: Math.min(selection.end, count - 1),
  };
}

/** Normalize given entire columns selection to given data matrix */
export function normalizeEntireColumns(
  selection: EntireColumns,
  data: Matrix.Matrix<unknown>
): EntireColumns {
  const count = Matrix.getColumnsCount(data);
  return {
    type: EntireType.Column,
    start: Math.max(selection.start, 0),
    end: Math.min(selection.end, count - 1),
  };
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
  if (active && selection) {
    if (PointRange.is(selection)) {
      return modifyRangeEdge(selection, active, data, edge);
    }
    switch (selection.type) {
      case EntireType.Row: {
        return modifyEntireRowsEdge(selection, active, data, edge);
      }
      case EntireType.Column: {
        return modifyEntireColumnsEdge(selection, active, data, edge);
      }
    }
  }
  return selection;
}

/** Modify given edge of given entire rows selection according to given active point and active matrix */
export function modifyEntireRowsEdge(
  selection: EntireRows,
  active: Point.Point,
  data: Matrix.Matrix<unknown>,
  edge: Direction
): EntireRows {
  if (edge === Direction.Left || edge === Direction.Right) {
    return selection;
  }
  const delta = edge === Direction.Top ? -1 : 1;
  const property = edge === Direction.Top ? "start" : "end";
  const oppositeProperty = property === "start" ? "end" : "start";
  let nextSelection;
  if (
    edge === Direction.Top
      ? selection.end > active.row
      : selection.start < active.row
  ) {
    nextSelection = {
      ...selection,
      [oppositeProperty]: selection[oppositeProperty] + delta,
    };
  } else {
    nextSelection = {
      ...selection,
      [property]: selection[property] + delta,
    };
  }
  return normalizeEntireRows(nextSelection, data);
}

/** Modify given edge of given entire rows selection according to given active point and active matrix */
export function modifyEntireColumnsEdge(
  selection: EntireColumns,
  active: Point.Point,
  data: Matrix.Matrix<unknown>,
  edge: Direction
): EntireColumns {
  if (edge === Direction.Top || edge === Direction.Bottom) {
    return selection;
  }
  const delta = edge === Direction.Left ? -1 : 1;
  const property = edge === Direction.Left ? "start" : "end";
  const oppositeProperty = property === "start" ? "end" : "start";
  let nextSelection;
  if (
    edge === Direction.Left
      ? selection.end > active.row
      : selection.start < active.row
  ) {
    nextSelection = {
      ...selection,
      [oppositeProperty]: selection[oppositeProperty] + delta,
    };
  } else {
    nextSelection = {
      ...selection,
      [property]: selection[property] + delta,
    };
  }
  return normalizeEntireColumns(nextSelection, data);
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
