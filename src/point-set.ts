/**
 * Immutable Set like interface of points
 */

import * as Point from "./point";
import * as PointMap from "./point-map";
import * as PointRange from "./point-range";

export type PointSet = PointMap.PointMap<boolean>;

/** Returns a boolean asserting whether an point is present with the given value in the Set object or not */
export const has = (set: PointSet, point: Point.Point): boolean =>
  PointMap.has(point, set);

/** Returns the number of points in a PointSet object */
export const size = (set: PointSet): number => PointMap.size(set);

/** Creates a new set with all points that pass the test implemented by the provided function */
export function filter(
  func: (point: Point.Point) => boolean,
  set: PointSet
): PointSet {
  return PointMap.filter((_, point) => func(point), set);
}

const minKey = (object: Record<number, any>): number => {
  /* @ts-ignore*/
  return Math.min(...Object.keys(object));
};

/** Returns the point on the minimal row in the minimal column in the set */
export function min(set: PointSet): Point.Point {
  const row = minKey(set);
  return { row, column: minKey(set[row]) };
}

const maxKey = (object: Record<number, any>): number =>
  // @ts-ignore
  Math.max(...Object.keys(object));

/** Returns the point on the maximal row in the maximal column in the set */
export function max(set: PointSet): Point.Point {
  const row = maxKey(set);
  return { row, column: maxKey(set[row]) };
}

/** Creates a new PointSet instance from an array-like or iterable object */
export function from(points: Point.Point[]): PointSet {
  return points.reduce(
    (acc, point) => PointMap.set<boolean>(point, true, acc),
    PointMap.from<boolean>([])
  );
}

/** Transform a point set to a range */
export function toRange(set: PointSet): PointRange.PointRange {
  const start = min(set);
  const end = max(set);
  return PointRange.create(start, end);
}

/** Add the given point to given set */
export function add(point: Point.Point, set: PointSet): PointSet {
  return PointMap.set<boolean>(point, true, set);
}

/** Remove the given point to given set */
export function remove(point: Point.Point, set: PointSet): PointSet {
  return PointMap.unset(point, set);
}

/** Create an array from given set */
export function toArray(set: PointSet): Point.Point[] {
  return PointMap.reduce(
    (acc, value, point) => [...acc, point],
    set,
    [] as Point.Point[]
  );
}

export function subtract(toSubtract: PointSet, set: PointSet): PointSet {
  let newSet = set;
  for (const point of toArray(toSubtract)) {
    newSet = remove(point, newSet);
  }
  return newSet;
}

export function* entries(set: PointSet): Generator<Point.Point> {
  for (const [point] of PointMap.entries(set)) {
    yield point;
  }
}
