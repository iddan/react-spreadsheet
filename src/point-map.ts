/**
 * Immutable unordered Map like interface of point to value pairs.
 */
import * as Point from "./point";

type Data<T> = {
  [K in number]: {
    [K in number]: T;
  };
};

export class PointMap<T> {
  private constructor(private data: Data<T>) {}

  /** Creates a new PointMap instance from an array-like object. */
  static from<T>(pairs: [Point.Point, T][]): PointMap<T> {
    const data: Data<T> = {};
    for (const [point, value] of pairs) {
      data[point.row] = data[point.row] || {};
      data[point.row][point.column] = value;
    }
    return new PointMap(data);
  }

  /** Sets the value for point in map */
  set(point: Point.Point, value: T): PointMap<T> {
    return new PointMap<T>({
      ...this.data,
      [point.row]: {
        ...this.data[point.row],
        [point.column]: value,
      },
    });
  }

  /** Un-sets the value for point in map */
  unset(point: Point.Point): PointMap<T> {
    const { row, column } = point;
    if (!(row in this.data) || !(column in this.data[row])) {
      return this;
    }
    const {
      // @ts-ignore
      [String(row)]: { [String(column)]: _, ...nextRow },
      ...nextMap
    } = this.data;
    if (Object.keys(nextRow).length === 0) {
      return new PointMap(nextMap);
    }
    return new PointMap({ ...nextMap, [row]: nextRow });
  }

  /** Gets the value for point in map */
  get(point: Point.Point): undefined | T {
    return this.data[point.row] && this.data[point.row][point.column];
  }

  /** Checks if map has point assigned to value */
  has(point: Point.Point): boolean {
    return point.row in this.data && point.column in this.data[point.row];
  }

  /** Returns the number of elements in a PointMap object. */
  size(): number {
    let acc = 0;
    const mapKeys = Object.keys(this.data);
    for (let i = 0; i < mapKeys.length; i++) {
      const row = Number(mapKeys[i]);
      const columns = this.data[row];
      acc += Object.keys(columns).length;
    }
    return acc;
  }

  /** Iterate over pairs of point and value in the map */
  *entries(): Generator<[Point.Point, T]> {
    for (const row in this.data) {
      for (const column in this.data[row]) {
        yield [
          { row: Number(row), column: Number(column) },
          this.data[row][column],
        ];
      }
    }
  }

  /** Iterate over the keys of the map */
  *keys(): Generator<Point.Point> {
    for (const row in this.data) {
      for (const column in this.data[row]) {
        yield { row: Number(row), column: Number(column) };
      }
    }
  }
}
