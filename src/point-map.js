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
  const rowKey = String(row);
  const columnKey = String(column);
  if (!(rowKey in map) || !(columnKey in map[rowKey])) {
    return map;
  }
  const {
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
  return Object.values(map).reduce(
    (acc, row) => acc + Object.keys(row).length,
    0
  );
}

/** Applies a function against an accumulator and each value and point in the map (from left to right) to reduce it to a single value */
export function reduce<A, T>(
  func: (A, value: T, point: Types.Point) => A,
  map: PointMap<T>,
  initialValue: A
): A {
  let acc = initialValue;
  for (const [row, columns] of Object.entries(map)) {
    for (const [column, value] of Object.entries(columns)) {
      acc = func(acc, value, { row: Number(row), column: Number(column) });
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
