// @flow

import * as Matrix from "./matrix";
import { flatMap } from "./util";

export type PointSet = {
  [row: number]: {
    [column: number]: boolean
  }
};

export type Point = {|
  row: number,
  column: number
|};

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

export function toArray(set: PointSet): Point[] {
  return flatMap(Object.entries(set), ([row, columns]) =>
    Object.keys(columns).map((column: number) => ({ row, column }))
  );
}

export function toMatrix<T>(
  set: PointSet,
  data: Matrix.Matrix<T>
): Matrix.Matrix<Descriptor<T>> {
  let matrix = [];
  for (const { row, column } of toArray(set)) {
    matrix = Matrix.set(
      row,
      column,
      { row, column, data: data[row][column] },
      matrix
    );
  }
  return matrix;
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
