/**
 * Immutable unordered Map like interface of point to value pairs.
 *
 * @flow
 */
import * as Types from "./types";
import { flatMap } from "./util";

export type PointMap<T> = {
  [row: number]: {
    [column: number]: T
  }
};

/** Sets the value for point in map */
export function set<T>(
  point: Types.Point,
  value: T,
  map: PointMap<T>
): PointMap<T> {
  return {
    ...map,
    [point.row]: {
      ...map[point.row],
      [point.column]: value
    }
  };
}

/** Gets the value for point in map */
export function get<T>(
  point: Types.Point,
  map: PointMap<T>
): typeof undefined | T {
  return map[point.row] && map[point.row][point.column];
}

/** Creates a new PointSet instance from an array-like or iterable object. */
export function from<T>(pairs: [Types.Point, T][]): PointMap<T> {
  return pairs.reduce((acc, [point, value]) => set(point, value, acc), {});
}
