/**
 * Immutable Set like interface of points
 */

import * as Point from "./point";
import { PointMap } from "./point-map";

export class PointSet {
  private constructor(
    private pointMap: PointMap<boolean> = PointMap.from([])
  ) {}

  /** Creates a new PointSet instance from an array-like or iterable object */
  static from(points: Point.Point[]): PointSet {
    return new PointSet(PointMap.from(points.map((point) => [point, true])));
  }

  /** Returns a boolean asserting whether an point is present with the given value in the Set object or not */
  has(point: Point.Point): boolean {
    return this.pointMap.has(point);
  }

  /** Returns the number of points in a PointSet object */
  size(): number {
    return this.pointMap.size();
  }

  /** Add the given point to given set */
  add(point: Point.Point): PointSet {
    return new PointSet(this.pointMap.set(point, true));
  }

  /** Remove the given point to given set */
  remove(point: Point.Point): PointSet {
    return new PointSet(this.pointMap.unset(point));
  }

  difference(other: PointSet): PointSet {
    let newSet = this as PointSet;
    for (const point of other) {
      newSet = newSet.remove(point);
    }
    return newSet;
  }

  [Symbol.iterator](): Iterator<Point.Point> {
    return this.pointMap.keys();
  }
}
