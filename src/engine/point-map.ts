/**
 * Immutable unordered Map like interface of point to value pairs.
 */
import * as Point from "../point";
import * as pointHash from "./point-hash";

export class PointMap<T> {
  private constructor(private map: Map<string, T>) {}

  /** Creates a new PointMap instance from an array-like object. */
  static from<T>(pairs: [Point.Point, T][]): PointMap<T> {
    return new PointMap(
      new Map(pairs.map(([point, value]) => [pointHash.toString(point), value]))
    );
  }

  /** Sets the value for point in map */
  set(point: Point.Point, value: T): PointMap<T> {
    const newMap = new Map(this.map);
    newMap.set(pointHash.toString(point), value);
    return new PointMap(newMap);
  }

  /** Un-sets the value for point in map */
  delete(point: Point.Point): PointMap<T> {
    const newMap = new Map(this.map);
    if (!newMap.delete(pointHash.toString(point))) {
      return this;
    }
    return new PointMap(newMap);
  }

  /** Gets the value for point in map */
  get(point: Point.Point): undefined | T {
    return this.map.get(pointHash.toString(point));
  }

  /** Checks if map has point assigned to value */
  has(point: Point.Point): boolean {
    return this.map.has(pointHash.toString(point));
  }

  /** Returns the number of elements in a PointMap object. */
  size(): number {
    return this.map.size;
  }

  /** Iterate over pairs of point and value in the map */
  *entries(): Generator<[Point.Point, T]> {
    for (const [key, value] of this.map) {
      yield [pointHash.fromString(key), value];
    }
  }

  /** Iterate over the keys of the map */
  *keys(): Generator<Point.Point> {
    for (const [key] of this.map) {
      yield pointHash.fromString(key);
    }
  }
}
