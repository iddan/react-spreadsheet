/**
 * Immutable unordered Map like interface of point to value pairs.
 */
import * as Point from "./point";
import { Matrix } from "./matrix";

export type PointMap<T> = {
  [K in number]: {
    [K in number]: T;
  };
};

/** Sets the value for point in map */
export function set<T>(
  point: Point.Point,
  value: T,
  map: PointMap<T>
): PointMap<T> {
  return {
    ...map,
    [point.row]: {
      ...map[point.row],
      [point.column]: value,
    },
  };
}

export function unset<T>(
  { row, column }: Point.Point,
  map: PointMap<T>
): PointMap<T> {
  if (!(row in map) || !(column in map[row])) {
    return map;
  }
  const {
    // @ts-ignore
    [String(row)]: { [String(column)]: _, ...nextRow },
    ...nextMap
  } = map;
  if (Object.keys(nextRow).length === 0) {
    return nextMap;
  }
  return { ...nextMap, [row]: nextRow };
}

/** Gets the value for point in map */
export function get<T>(point: Point.Point, map: PointMap<T>): undefined | T {
  return map[point.row] && map[point.row][point.column];
}

/** Checks if map has point assigned to value */
export function has<T>(point: Point.Point, map: PointMap<T>): boolean {
  return point.row in map && point.column in map[point.row];
}

/** Get all the values of a certain row */
export function getRow<T>(row: number, map: PointMap<T>): T[] {
  return row in map
    ? // @ts-ignore
      Object.keys(map[row]).map((column) => map[row][column])
    : [];
}

/** Get all the values of a certain column */
export function getColumn<T>(column: number, map: PointMap<T>): T[] {
  return (
    Object.keys(map)
      // @ts-ignore
      .filter((row) => column in map[row])
      // @ts-ignore
      .map((row) => map[row][column])
  );
}

const EMPTY: PointMap<any> = {} as any;

/** Creates a new PointMap instance from an array-like or iterable object. */
export function from<T>(pairs: [Point.Point, T][]): PointMap<T> {
  return pairs.reduce((acc, [point, value]) => set(point, value, acc), EMPTY);
}

/** Creates a new PointMap instance from a Matrix. */
export function fromMatrix<T>(matrix: Matrix<T>): PointMap<T> {
  return matrix.reduce(
    (rowAcc, data, row) =>
      data.reduce(
        (colAcc, cell, column) =>
          cell ? set({ row, column }, cell, colAcc) : colAcc,
        rowAcc
      ),
    EMPTY
  );
}

/** Returns the number of elements in a PointMap object. */
export function size(map: PointMap<unknown>): number {
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
  func: (acc: A, value: T, point: Point.Point) => A,
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
export function map<T1, T2>(
  func: (t1: T1) => T2,
  map: PointMap<T1>
): PointMap<T2> {
  return reduce(
    (acc, value, point) => set(point, func(value), acc),
    map,
    from([])
  );
}

/** Creates a new map of all values predicate returns truthy for. The predicate is invoked with two arguments: (value, key) */
export function filter<T>(
  predicate: (value: T, point: Point.Point) => boolean,
  map: PointMap<T>
): PointMap<T> {
  return reduce(
    (acc, value, point) => {
      if (predicate(value, point)) {
        return set(point, value, acc);
      }
      return acc;
    },
    map,
    from([])
  );
}

/** Returns whether map has any points set to value */
export function isEmpty(map: PointMap<unknown>): boolean {
  return Object.keys(map).length === 0;
}

export function* entries<T>(map: PointMap<T>): Generator<[Point.Point, T]> {
  for (const row in map) {
    for (const column in map[row]) {
      yield [{ row: Number(row), column: Number(column) }, map[row][column]];
    }
  }
}
