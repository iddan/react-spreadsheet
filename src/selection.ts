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

export type Selection =
  | PointRange.PointRange
  | EntireRowsSelection
  | EntireColumnsSelection
  | EntireTableSelection
  | null;

/** Get the number of points selected */
export function size(selection: Selection): number {
  if (!PointRange.is(selection)) {
    return 0;
  }
  return PointRange.size(selection);
}

/** Is the given point selected */
export function has(selection: Selection, point: Point.Point): boolean {
  return PointRange.is(selection) && PointRange.has(selection, point);
}

/** Normalize given selected range to given data matrix */
export function normalize(
  selection: Selection,
  data: Matrix.Matrix<unknown>
): Selection {
  const dataRange = getMatrixRange(data);
  return PointRange.is(selection)
    ? PointRange.mask(selection, dataRange)
    : selection;
}

/** Get selected points */
export function getPoints(selected: Selection): Point.Point[] {
  return PointRange.is(selected)
    ? Array.from(PointRange.iterate(selected))
    : [];
}

/** Get given selection from given data */
export function getSelectionFromMatrix<T>(
  selection: Selection,
  data: Matrix.Matrix<T>
): Matrix.Matrix<T> {
  if (!PointRange.is(selection)) {
    return [];
  }
  return getRangeFromMatrix(selection, data);
}

/** Modify given edge of given selection according to given active point and data matrix */
export function modifyEdge(
  selection: Selection,
  active: Point.Point | null,
  data: Matrix.Matrix<unknown>,
  edge: Direction
): Selection {
  if (!active || !PointRange.is(selection)) {
    return selection;
  }

  const field =
    edge === Direction.Left || edge === Direction.Right ? "column" : "row";

  const key =
    edge === Direction.Left || edge === Direction.Top ? "start" : "end";
  const delta = key === "start" ? -1 : 1;

  const edgeOffsets = PointRange.has(selection, {
    ...active,
    [field]: active[field] + delta * -1,
  });

  const keyToModify = edgeOffsets ? (key === "start" ? "end" : "start") : key;

  const nextSelection: PointRange.PointRange = {
    ...selection,
    [keyToModify]: {
      ...selection[keyToModify],
      [field]: selection[keyToModify][field] + delta,
    },
  };

  return normalize(nextSelection, data);
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
