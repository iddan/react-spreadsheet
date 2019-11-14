/**
 * Immutable Set like interface of points
 *
 */

import {IPoint} from "./types";
import * as PointMap from "./point-map";

export type PointSet = PointMap.PointMap<boolean>;

export interface IDescriptor<T> extends IPoint {
  data: T;
}

/** Appends a new IPoint to the Set object */
export const add = (set: PointSet, IPoint: IPoint): PointSet =>
  PointMap.set(IPoint, true, set);

/** Removes the IPoint from the Set object */
export const remove = (set: PointSet, IPoint: IPoint): PointSet =>
  PointMap.unset(IPoint, set);

/** Returns a boolean asserting whether an IPoint is present with the given value in the Set object or not */
export const has = (set: PointSet, IPoint: IPoint): boolean =>
  PointMap.has(IPoint, set);

/** Returns the number of points in a PointSet object */
export const size = (set: PointSet) => PointMap.size(set);

/** Applies a function against an accumulator and each IPoint in the set (from left to right) to reduce it to a single value */
export function reduce<T>(
  func: (_: T, __: IPoint) => T,
  set: PointSet,
  initialValue: T
): T {
  return PointMap.reduce(
    (acc, _, IPoint) => func(acc, IPoint),
    set,
    initialValue
  );
}

/** Creates a new set with the results of calling a provided function on every IPoint in the calling set */
export function map(func: (_: IPoint) => IPoint, set: PointSet): PointSet {
  return reduce((acc, IPoint) => add(acc, func(IPoint)), set, from([]));
}

/** Creates a new set with all points that pass the test implemented by the provided function */
export function filter(func: (_: IPoint) => boolean, set: PointSet): PointSet {
  return reduce(
    (acc, IPoint) => {
      if (func(IPoint)) {
        return add(acc, IPoint);
      }
      return acc;
    },
    set,
    from([])
  );
}

const minKey = (object: { [key: number]: any }): number =>
  Math.min(...Object.keys(object) as any);

/** Returns the IPoint on the minimal row in the minimal column in the set */
export function min(set: PointSet): IPoint {
  const row = minKey(set);
  return { row, column: minKey(set[row]) };
}

const maxKey = (object: { [key: number]: any }): number =>
  // $FlowFixMe
  Math.max(...Object.keys(object) as any);

/** Returns the IPoint on the maximal row in the maximal column in the set */
export function max(set: PointSet): IPoint {
  const row = maxKey(set);
  return { row, column: maxKey(set[row]) };
}

/** Creates a new PointSet instance from an array-like or iterable object */
export function from(points: IPoint[]): PointSet {
  return points.reduce(add, PointMap.from([]));
}

/** Returns whether set has any points in */
export const isEmpty = (set: PointSet) => PointMap.isEmpty(set);

/** Returns an array of the set points */
export function toArray(set: PointSet): IPoint[] {
  return reduce((acc: IPoint[], IPoint: IPoint) => [...acc, IPoint], set, []);
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
  bottom: false
};

export function onEdge(set: PointSet, IPoint: IPoint): OnEdge {
  if (!has(set, IPoint)) {
    return NO_EDGE;
  }

  let hasNot = (rowDelta: number, columnDelta: number) =>
    !has(set, {
      row: IPoint.row + rowDelta,
      column: IPoint.column + columnDelta
    });

  return {
    left: hasNot(0, -1),
    right: hasNot(0, 1),
    top: hasNot(-1, 0),
    bottom: hasNot(1, 0)
  };
}

export function getEdgeValue(
  set: PointSet,
  field: keyof IPoint,
  delta: number
): number {
  const compare = Math.sign(delta) === -1 ? Math.min : Math.max;
  if (size(set) === 0) {
    throw new Error("getEdgeValue() should never be called with an empty set");
  }
  return reduce(
    (acc: any, point: any) => {
      if (acc === null) {
        return point[field];
      }
      return compare(acc, point[field]);
    },
    set,
    null
  );
}

export function extendEdge(
  set: PointSet,
  field: keyof IPoint,
  delta: number
): PointSet {
  const oppositeField = field === "row" ? "column" : "row";
  const edgeValue = getEdgeValue(set, field, delta);
  return reduce(
    (acc: any, point: any) => {
      if (point[field] === edgeValue) {
        return add(acc, {
          [field]: edgeValue + delta,
          [oppositeField]: point[oppositeField]
        } as IPoint);
      }
      return acc;
    },
    set,
    set
  );
}

export function shrinkEdge(
  set: PointSet,
  field: keyof IPoint,
  delta: number
): PointSet {
  const edgeValue = getEdgeValue(set, field, delta);
  return reduce(
    (acc, IPoint) => {
      if (IPoint[field] === edgeValue) {
        return remove(acc, IPoint);
      }
      return acc;
    },
    set,
    set
  );
}
