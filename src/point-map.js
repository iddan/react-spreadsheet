/**
 * Immutable unordered Map like interface of point to value pairs.
 *
 * @flow
 */
import * as Types from "./types";

export type PointMap<T> = {|
  [row: number]: {|
    [column: number]: T
  |}
|};

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

export function unset<T>(
  { row, column }: Types.Point,
  map: PointMap<T>
): PointMap<T> {
  if (!(row in map) || !(column in map[row])) {
    return map;
  }
  const {
    // $FlowFixMe
    [String(row)]: { [String(column)]: _, ...nextRow },
    ...nextMap
  } = map;
  if (Object.keys(nextRow).length === 0) {
    return nextMap;
  }
  return { ...nextMap, [row]: nextRow };
}

/** Gets the value for point in map */
export function get<T>(
  point: Types.Point,
  map: PointMap<T>
): typeof undefined | T {
  return map[point.row] && map[point.row][point.column];
}

/** Checks if map has point assigned to value */
export function has<T>(point: Types.Point, map: PointMap<T>): boolean {
  return point.row in map && point.column in map[point.row];
}

const EMPTY: PointMap<any> = ({}: any);

/** Creates a new PointMap instance from an array-like or iterable object. */
export function from<T>(pairs: [Types.Point, T][]): PointMap<T> {
  return pairs.reduce((acc, [point, value]) => set(point, value, acc), EMPTY);
}

/** Returns the number of elements in a PointMap object. */
export function size(map: PointMap<*>): number {
  let acc = 0;
  const _map_keys = Object.keys(map);
  for (let i = 0; i < _map_keys.length; i++) {
    const row = Number(_map_keys[i]);
    const columns = map[row];
    acc += Object.keys(columns).length;
  }
  return acc;
}

/** Applies a function against an accumulator and each value and point in the map (from left to right) to reduce it to a single value */
export function reduce<A, T>(
  func: (A, value: T, point: Types.Point) => A,
  map: PointMap<T>,
  initialValue: A
): A {
  let acc = initialValue;
  const _map_keys = Object.keys(map);
  for (let i = 0; i < _map_keys.length; i++) {
    const row = Number(_map_keys[i]);
    const columns = map[row];
    const _columns_keys = Object.keys(columns);
    for (let j = 0; j < _columns_keys.length; j++) {
      const column = Number(_columns_keys[j]);
      const value = columns[column];
      acc = func(acc, value, { row: row, column: column });
    }
  }
  return acc;
}

/** Creates a new map with the results of calling a provided function on every value in the calling map */
export function map<T1, T2>(func: T1 => T2, map: PointMap<T1>): PointMap<T2> {
  return reduce(
    (acc, value, point) => set(point, func(value), acc),
    map,
    from([])
  );
}

/** Returns whether map has any points set to value */
export function isEmpty(map: PointMap<any>): boolean {
  return Object.keys(map).length === 0;
}
