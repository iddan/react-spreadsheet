/**
 * Immutable unordered Map like interface of point to value pairs.
 *
 * @flow
 */
import * as Types from "./types";

export type PointMap<T> = {
  [row: number]: {
    [column: number]: T
  }
};

/** Sets the value for point in map */
export function set<T>(
  point: Types.Point,
  value: T,
  pointMap: PointMap<T>
): PointMap<T> {
  return {
    ...pointMap,
    [point.row]: {
      ...pointMap[point.row],
      [point.column]: value
    }
  };
}

/** Creates a new PointSet instance from an array-like or iterable object. */
export function from<T>(pairs: [Types.Point, T][]): PointMap<T> {
  return pairs.reduce((acc, [point, value]) => set(point, value, acc), {});
}
