// @flow

import * as Matrix from "./matrix";
import { flatMap } from "./util";
import type { Point } from "./types";

export type PointSet = {
  [row: number]: {
    [column: number]: boolean
  }
};

export type Descriptor<T> = Point & {|
  data: T
|};

export function add(set: PointSet, { row, column }: Point): PointSet {
  return { ...set, [row]: { ...set[row], [column]: true } };
}

export function remove(set: PointSet, { row, column }: Point): PointSet {
  return { ...set, [row]: { ...set[row], [column]: false } };
}

export function has(set: PointSet, { row, column }: Point): boolean {
  return Boolean(set[row] && set[row][column]);
}

const minKey = (object: { [key: number]: any }) =>
  Math.min(...Object.keys(object));

export function min(set: PointSet): Point {
  const row = minKey(set);
  return { row, column: minKey(set[row]) };
}

export function of(points: Point[]) {
  return points.reduce(add, {});
}

export function isEmpty(set: PointSet) {
  return Object.keys(set).length === 0;
}

export const reduce = <T>(
  func: (T, Point) => T,
  set: PointSet,
  initialValue: T
): T => {
  let acc = initialValue;
  for (const [row, columns] of Object.entries(set)) {
    for (const column of Object.keys(columns)) {
      acc = func(acc, { row: Number(row), column: Number(column) });
    }
  }
  return acc;
};

export const map = (func: Point => Point, set: PointSet): PointSet =>
  reduce((acc, point) => add(acc, func(point)), set, of([]));

export function toArray(set: PointSet): Point[] {
  return flatMap(
    Object.entries(set),
    ([row, columns]: [string, { [key: string]: boolean }]) =>
      Object.keys(columns).map(column => ({
        row: Number(row),
        column: Number(column)
      }))
  );
}

/** @todo return Matrix.Matrix<T> */
export function toMatrix<T>(
  set: PointSet,
  data: Matrix.Matrix<T>
): Matrix.Matrix<Descriptor<T>> {
  return reduce(
    (acc, { row, column }) =>
      Matrix.set(
        row,
        column,
        { row, column, data: Matrix.get(row, column, data) },
        acc
      ),
    set,
    []
  );
}

type OnEdge = {|
  left: boolean,
  right: boolean,
  top: boolean,
  bottom: boolean
|};

const NO_EDGE: OnEdge = {
  left: false,
  right: false,
  top: false,
  bottom: false
};

export function onEdge(set: PointSet, point: Point): OnEdge {
  if (!has(set, point)) {
    return NO_EDGE;
  }

  let hasNot = (rowDelta, columnDelta) =>
    !has(set, {
      row: point.row + rowDelta,
      column: point.column + columnDelta
    });

  return {
    left: hasNot(0, -1),
    right: hasNot(0, 1),
    top: hasNot(-1, 0),
    bottom: hasNot(1, 0)
  };
}
