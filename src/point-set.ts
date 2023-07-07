/**
 * Immutable Set like interface of points
 */

import * as Point from "./point";
import { PointMap } from "./point-map";
import * as PointRange from "./point-range";

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

  /** Returns the point on the minimal row in the minimal column in the set */
  min(): Point.Point {
    return this.pointMap.min();
  }

  /** Returns the point on the maximal row in the maximal column in the set */
  max(): Point.Point {
    return this.pointMap.max();
  }

  /** Transform a point set to a range */
  toRange(): PointRange.PointRange {
    const start = this.min();
    const end = this.max();
    return PointRange.create(start, end);
  }

  /** Add the given point to given set */
  add(point: Point.Point): PointSet {
    return new PointSet(this.pointMap.set(point, true));
  }

  /** Remove the given point to given set */
  remove(point: Point.Point): PointSet {
    return new PointSet(this.pointMap.unset(point));
  }

  subtract(toSubtract: PointSet): PointSet {
    let newSet = this as PointSet;
    for (const point of toSubtract.toArray()) {
      newSet = newSet.remove(point);
    }
    return newSet;
  }

  /** Create an array from given set */
  toArray(): Point.Point[] {
    return Array.from(this.values());
  }

  *values(): Generator<Point.Point> {
    yield* this.pointMap.keys();
  }
}
