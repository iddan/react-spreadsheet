import * as Point from "../point";
import * as pointHash from "./point-hash";

/**
 * Immutable Set like interface of points
 */
export class PointSet {
  private constructor(private set: Set<string>) {}

  /** Creates a new PointSet instance from an array-like or iterable object */
  static from(points: Iterable<Point.Point>): PointSet {
    const set = new Set<string>();
    for (const point of points) {
      set.add(pointHash.toString(point));
    }
    return new PointSet(set);
  }

  /** Returns a boolean asserting whether an point is present with the given value in the Set object or not */
  has(point: Point.Point): boolean {
    return this.set.has(pointHash.toString(point));
  }

  /** Returns the number of points in a PointSet object */
  get size(): number {
    return this.set.size;
  }

  /** Add the given point to given set */
  add(point: Point.Point): PointSet {
    const newSet = new Set(this.set);
    newSet.add(pointHash.toString(point));
    return new PointSet(newSet);
  }

  /** Remove the given point from the given set */
  delete(point: Point.Point): PointSet {
    const newSet = new Set(this.set);
    if (!newSet.delete(pointHash.toString(point))) {
      return this;
    }
    return new PointSet(newSet);
  }

  /** Returns a new PointSet with points common to the set and other */
  difference(other: PointSet): PointSet {
    let newSet = this as PointSet;
    for (const point of other) {
      newSet = newSet.delete(point);
    }
    return newSet;
  }

  /** Returns a new PointSet with all points in both sets */
  union(other: PointSet): PointSet {
    let newSet = this as PointSet;
    for (const point of other) {
      newSet = newSet.add(point);
    }
    return newSet;
  }

  /** Creates an iterator of points in the set */
  *[Symbol.iterator](): Iterator<Point.Point> {
    for (const value of this.set) {
      yield pointHash.fromString(value);
    }
  }
}
