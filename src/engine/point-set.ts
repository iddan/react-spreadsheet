/**
 * Immutable Set like interface of points
 */

import * as Point from "../point";
import * as pointHash from "./point-hash";

export class PointSet {
  private constructor(private set: Set<string>) {}
  /** Creates a new PointSet instance from an array-like or iterable object */
  static from(points: Point.Point[]): PointSet {
    return new PointSet(new Set(points.map(pointHash.toString)));
  }

  /** Returns a boolean asserting whether an point is present with the given value in the Set object or not */
  has(point: Point.Point): boolean {
    return this.set.has(pointHash.toString(point));
  }

  /** Returns the number of points in a PointSet object */
  size(): number {
    return this.set.size;
  }

  /** Add the given point to given set */
  add(point: Point.Point): PointSet {
    const newSet = new Set(this.set);
    newSet.add(pointHash.toString(point));
    return new PointSet(newSet);
  }

  /** Remove the given point to given set */
  delete(point: Point.Point): PointSet {
    const newSet = new Set(this.set);
    if (!newSet.delete(pointHash.toString(point))) {
      return this;
    }
    return new PointSet(newSet);
  }

  difference(other: PointSet): PointSet {
    let newSet = this as PointSet;
    for (const point of other) {
      newSet = newSet.delete(point);
    }
    return newSet;
  }

  *[Symbol.iterator](): Iterator<Point.Point> {
    for (const value of this.set) {
      yield pointHash.fromString(value);
    }
  }
}
