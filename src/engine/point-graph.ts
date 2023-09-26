import { Point } from "../point";
import * as pointHash from "./point-hash";
import { PointSet } from "./point-set";

/**
 * Immutable directed graph of points, where each point can have multiple
 * edges to other points.
 */
export class PointGraph {
  private constructor(private forwards = new Map<string, PointSet>()) {}

  /** Creates a new PointGraph instance from an array-like or iterable object */
  static from(pairs: Iterable<[Point, PointSet]>): PointGraph {
    const forwards = new Map<string, PointSet>();
    for (const [node, edges] of pairs) {
      forwards.set(pointHash.toString(node), edges);
    }
    return new PointGraph(forwards);
  }

  set(node: Point, edges: PointSet): PointGraph {
    const newGraph = new PointGraph(new Map(this.forwards));
    if (edges.size === 0) {
      newGraph.forwards.delete(pointHash.toString(node));
      return newGraph;
    }
    newGraph.forwards.set(pointHash.toString(node), edges);
    return newGraph;
  }

  get(node: Point): PointSet {
    return this.forwards.get(pointHash.toString(node)) || PointSet.from([]);
  }

  getBackwards(node: Point): PointSet {
    let result = PointSet.from([]);
    for (const [key, value] of this.forwards) {
      if (value.has(node)) {
        result = result.add(pointHash.fromString(key));
      }
    }
    return result;
  }

  getBackwardsRecursive(
    node: Point,
    visited: PointSet = PointSet.from([])
  ): PointSet {
    let result = this.getBackwards(node);
    let newVisited = visited;
    for (const point of result) {
      if (newVisited.has(point)) {
        continue;
      }
      newVisited = newVisited.add(point);
      result = result.union(this.getBackwardsRecursive(point, newVisited));
    }
    return result;
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

      const dependents = this.get(current);

      if (!dependents) {
        continue;
      }

      for (const dependent of dependents) {
        stack.push(dependent);
      }
    }

    return false;
  }

  *[Symbol.iterator](): Iterator<[Point, PointSet]> {
    const visitedHashes = new Set<string>();
    for (const [key, values] of this.forwards) {
      const point = pointHash.fromString(key);
      visitedHashes.add(key);
      yield [point, values];

      // Make sure to include values that are not included in the forwards map keys
      for (const value of values) {
        const hash = pointHash.toString(value);
        if (!visitedHashes.has(hash) && !this.forwards.has(hash)) {
          visitedHashes.add(hash);
          yield [value, PointSet.from([])];
        }
      }
    }
  }

  /** Get the points in the graph in a breadth-first order */
  *traverseBFSBackwards(): Generator<Point> {
    // Create a Set to store the points that have been visited
    let visited = PointSet.from([]);

    // Create a queue to store the points that still need to be visited
    const queue: Point[] = [];

    // Iterate over all the points and add the ones with no dependencies to the queue
    for (const [point, values] of this) {
      if (values.size === 0) {
        visited = visited.add(point);
        queue.push(point);
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
      const dependents = this.getBackwards(point);

      // If there are no dependents, skip to the next iteration
      if (dependents.size === 0) {
        continue;
      }

      // Otherwise, add the dependents to the queue if they have not yet been visited
      for (const dependent of dependents) {
        if (
          !visited.has(dependent) &&
          this.get(dependent).difference(visited).size === 0
        ) {
          queue.push(dependent);
          visited = visited.add(dependent);
        }
      }
    }
  }
}
