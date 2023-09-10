import { Point } from "../point";
import { PointMap } from "./point-map";
import { PointSet } from "./point-set";

/** A graph of points */
export class PointGraph {
  private constructor(
    private forward: PointMap<PointSet>,
    private backward: PointMap<PointSet>
  ) {}

  /** Creates a new PointGraph instance from an array-like object. */
  static from(pairs: Array<[Point, PointSet]>): PointGraph {
    let backward = PointMap.from<PointSet>([]);
    for (const [point, points] of pairs) {
      backward = backward.set(point, backward.get(point) || PointSet.from([]));
      for (const p of points) {
        const set = backward.get(p) || PointSet.from([]);
        backward = backward.set(p, set.add(point));
      }
    }
    return new PointGraph(PointMap.from(pairs), backward);
  }

  /** Set points for point */
  set(point: Point, points: PointSet): PointGraph {
    const newForward =
      points.size() === 0
        ? this.forward.delete(point)
        : this.forward.set(point, points);

    const existing = this.forward.get(point);

    let newBackward = this.backward;

    if (points.size() === 0) {
      newBackward = newBackward.delete(point);
      if (existing) {
        for (const p of existing) {
          const set = newBackward.get(p);
          if (!set) {
            continue;
          }
          const newSet = set.delete(point);
          if (newSet.size() === 0) {
            newBackward = newBackward.delete(p);
          } else {
            newBackward = newBackward.set(p, newSet);
          }
        }
      }
    } else {
      const [toAdd, toRemove] = existing
        ? [points.difference(existing), existing.difference(points)]
        : [points, PointSet.from([])];

      newBackward = newBackward.set(
        point,
        newBackward.get(point) || PointSet.from([])
      );

      for (const p of toAdd) {
        const set = newBackward.get(p) || PointSet.from([]);
        newBackward = newBackward.set(p, set.add(point));
      }

      for (const p of toRemove) {
        const set = newBackward.get(p);
        if (!set) {
          continue;
        }
        const newSet = set.delete(point);
        newBackward =
          newSet.size() === 0
            ? newBackward.delete(p)
            : newBackward.set(p, newSet);
      }
    }
    return new PointGraph(newForward, newBackward);
  }

  /** Get points for point backwards */
  getBackwards(point: Point): PointSet {
    return this.backward.get(point) || PointSet.from([]);
  }

  /** Recursively get points for point backwards */
  *getBackwardsRecursive(point: Point): Generator<Point> {
    // Create a stack to store the points to visit
    const stack: Point[] = [point];

    // While there are points to visit, pop the top point and add its dependents to the stack
    while (stack.length > 0) {
      const current = stack.pop();
      if (!current) {
        continue;
      }

      // Get the set of points that depend on the current point
      const backwardDependencies = this.backward.get(current);

      // If there are no dependents, skip to the next point
      if (!backwardDependencies) {
        continue;
      }

      // Otherwise, add the dependents to the stack if they have not yet been visited
      for (const dependent of backwardDependencies) {
        yield dependent;
        stack.push(dependent);
      }
    }
  }

  /** Determine whether the graph has a circular dependency, starting from given start point */
  hasCircularDependency(startPoint: Point): boolean {
    let visited = PointSet.from([]);
    const stack: Point[] = [startPoint];

    while (stack.length > 0) {
      const current = stack.pop();
      if (!current) {
        continue;
      }

      if (visited.has(current)) {
        return true;
      }

      visited = visited.add(current);

      const dependents = this.forward.get(current);

      if (!dependents) {
        continue;
      }

      for (const dependent of dependents) {
        stack.push(dependent);
      }
    }

    return false;
  }

  /** Get the points in the graph in a breadth-first order */
  *traverseBFS(): Generator<Point> {
    // Create a Set to store the points that have been visited
    let visited = PointSet.from([]);

    // Create a queue to store the points that still need to be visited
    const queue: Point[] = [];

    // Iterate over all the points in the backward map and add the ones with no dependencies to the queue
    for (const [point, dependencies] of this.backward.entries()) {
      if (dependencies.size() === 0 && !visited.has(point)) {
        queue.push(point);
        visited = visited.add(point);
      }
    }

    // While there are points in the queue, remove the first one and yield it
    while (queue.length > 0) {
      const point = queue.shift();
      if (!point) {
        continue;
      }
      yield point;

      // Get the set of points that depend on the current point
      const dependents = this.forward.get(point);

      // If there are no dependents, skip to the next iteration
      if (!dependents) {
        continue;
      }

      // Otherwise, add the dependents to the queue if they have not yet been visited
      for (const dependent of dependents) {
        if (!visited.has(dependent)) {
          queue.push(dependent);
          visited = visited.add(dependent);
        }
      }
    }
  }
}
