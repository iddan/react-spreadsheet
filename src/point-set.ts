/**
 * Immutable Set like interface of points
 */

import { Point } from "./types";
import * as PointMap from "./point-map";

export type PointSet = PointMap.PointMap<boolean>;

export type Descriptor<T> = {
  data: T;
} & Point;

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

/** Creates a new PointSet instance from an array-like or iterable object */
export function from(points: Point[]): PointSet {
  return points.reduce(
    (acc, point) => PointMap.set<boolean>(point, true, acc),
    PointMap.from<boolean>([])
  );
}

type OnEdge = {
  left: boolean;
  right: boolean;
  top: boolean;
  bottom: boolean;
};

const NO_EDGE: OnEdge = {
  left: false,
  right: false,
  top: false,
  bottom: false,
};

export function onEdge(set: PointSet, point: Point): OnEdge {
  if (!has(set, point)) {
    return NO_EDGE;
  }

  const hasNot = (rowDelta: number, columnDelta: number) =>
    !has(set, {
      row: point.row + rowDelta,
      column: point.column + columnDelta,
    });

  return {
    left: hasNot(0, -1),
    right: hasNot(0, 1),
    top: hasNot(-1, 0),
    bottom: hasNot(1, 0),
  };
}
