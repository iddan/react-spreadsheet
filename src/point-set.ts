/**
 * Immutable Set like interface of points
 */

import { Point } from "./types";
import * as PointMap from "./point-map";

export type PointSet = PointMap.PointMap<boolean>;

export type Descriptor<T> = {
  data: T;
} & Point;

export enum Edge {
  Left = "left",
  Top = "top",
  Right = "right",
  Bottom = "bottom",
}

type OnEdge = { [key in Edge]: boolean };

export const EDGE_TO_FIELD: { [key in Edge]: keyof Point } = {
  [Edge.Left]: "column",
  [Edge.Top]: "row",
  [Edge.Right]: "column",
  [Edge.Bottom]: "row",
};

/** Appends a new point to the Set object */
export const add = (set: PointSet, point: Point): PointSet =>
  PointMap.set(point, true, set);

/** Removes the point from the Set object */
export const remove = (set: PointSet, point: Point): PointSet =>
  PointMap.unset(point, set);

/** Returns a boolean asserting whether an point is present with the given value in the Set object or not */
export const has = (set: PointSet, point: Point): boolean =>
  PointMap.has(point, set);

/** Returns the number of points in a PointSet object */
export const size = (set: PointSet): number => PointMap.size(set);

/** Applies a function against an accumulator and each point in the set (from left to right) to reduce it to a single value */
export function reduce<T>(
  func: (t: T, point: Point) => T,
  set: PointSet,
  initialValue: T
): T {
  return PointMap.reduce(
    (acc, _, point) => func(acc, point),
    set,
    initialValue
  );
}

/** Creates a new set with the results of calling a provided function on every point in the calling set */
export function map(func: (point: Point) => Point, set: PointSet): PointSet {
  return reduce((acc, point) => add(acc, func(point)), set, from([]));
}

/** Creates a new set with all points that pass the test implemented by the provided function */
export function filter(
  func: (point: Point) => boolean,
  set: PointSet
): PointSet {
  return PointMap.filter((_, point) => func(point), set);
}

const minKey = (object: Record<number, any>): number =>
  // @ts-ignore
  Math.min(...Object.keys(object));

/** Returns the point on the minimal row in the minimal column in the set */
export function min(set: PointSet): Point {
  const row = minKey(set);
  return { row, column: minKey(set[row]) };
}

const maxKey = (object: Record<number, any>): number =>
  // @ts-ignore
  Math.max(...Object.keys(object));

/** Returns the point on the maximal row in the maximal column in the set */
export function max(set: PointSet): Point {
  const row = maxKey(set);
  return { row, column: maxKey(set[row]) };
}

/** Creates a new PointSet instance from an array-like or iterable object */
export function from(points: Point[]): PointSet {
  return points.reduce(add, PointMap.from([]));
}

/** Returns whether set has any points in */
export const isEmpty = (set: PointSet): boolean => PointMap.isEmpty(set);

/** Returns an array of the set points */
export function toArray(set: PointSet): Point[] {
  return reduce((acc: Point[], point: Point) => [...acc, point], set, []);
}

const NO_EDGES: OnEdge = {
  left: false,
  right: false,
  top: false,
  bottom: false,
};

/**
 * Returns whether the given point is on the given edge of the given set
 * Assumes the point set is not sparse
 */
export function onEdge(set: PointSet, point: Point, edge: Edge): boolean {
  let rowDelta: number;
  let columnDelta: number;
  switch (edge) {
    case Edge.Left:
      rowDelta = -1;
      columnDelta = 0;
      break;
    case Edge.Top:
      rowDelta = -1;
      columnDelta = 0;
      break;
    case Edge.Right:
      rowDelta = 0;
      columnDelta = 1;
      break;
    case Edge.Bottom:
      rowDelta = 1;
      columnDelta = 0;
      break;
  }
  return !has(set, {
    row: point.row + rowDelta,
    column: point.column + columnDelta,
  });
}

/**
 * Returns whether the given point is on the edges of the given set
 * Assumes the point set is not sparse
 */
export function onEdges(set: PointSet, point: Point): OnEdge {
  if (!has(set, point)) {
    return NO_EDGES;
  }
  return {
    left: onEdge(set, point, Edge.Left),
    top: onEdge(set, point, Edge.Top),
    right: onEdge(set, point, Edge.Right),
    bottom: onEdge(set, point, Edge.Bottom),
  };
}

/** Gets the coordinate of the given edge in the given set */
export function getEdgeValue(set: PointSet, edge: Edge): number {
  if (isEmpty(set)) {
    throw new Error("getEdgeValue() should never be called with an empty set");
  }

  const compare = edge === Edge.Left || edge === Edge.Top ? Math.min : Math.max;
  const field = EDGE_TO_FIELD[edge];

  const result = reduce<number | null>(
    (acc, point) => {
      if (acc === null) {
        return point[field];
      }
      return compare(acc, point[field]);
    },
    set,
    null
  );

  if (result === null) {
    throw new Error("Unexpected value");
  }

  return result;
}

/** Extends the given edge of the given set by given delta */
export function extendEdge(set: PointSet, edge: Edge, delta: number): PointSet {
  const edgeValue = getEdgeValue(set, edge);
  const field = EDGE_TO_FIELD[edge];
  return reduce(
    (acc, point) => {
      if (point[field] === edgeValue) {
        return add(acc, {
          ...point,
          [field]: edgeValue + delta,
        } as Point);
      }
      return acc;
    },
    set,
    set
  );
}

/** Shrinks the given edge of the given set by given delta */
export function shrinkEdge(set: PointSet, edge: Edge, delta: number): PointSet {
  if (isEmpty(set)) {
    return set;
  }
  const edgeValue = getEdgeValue(set, edge);
  const field = EDGE_TO_FIELD[edge];
  return reduce(
    (acc, point) => {
      if (point[field] >= edgeValue - delta + 1) {
        return remove(acc, point);
      }
      return acc;
    },
    set,
    set
  );
}
