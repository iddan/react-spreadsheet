import { Point } from "./point";
import * as pointMap from "./point-map";
import * as pointSet from "./point-set";

export type PointGraph = {
  forward: pointMap.PointMap<pointSet.PointSet>;
  backward: pointMap.PointMap<pointSet.PointSet>;
};

export function from(pairs: Array<[Point, pointSet.PointSet]>): PointGraph {
  let backward = pointMap.from<pointSet.PointSet>([]);
  for (const [point, points] of pairs) {
    const set = pointMap.get(point, backward) || pointSet.from([]);
    for (const p of pointSet.toArray(points)) {
      backward = pointMap.set(p, pointSet.add(point, set), backward);
    }
  }
  return {
    forward: pointMap.from(pairs),
    backward,
  };
}

export function set(
  point: Point,
  points: pointSet.PointSet,
  graph: PointGraph
): PointGraph {
  const newForward =
    pointSet.size(points) === 0
      ? pointMap.unset(point, graph.forward)
      : pointMap.set(point, points, graph.forward);

  const existing = pointMap.get(point, graph.forward);
  const toAdd = existing ? pointSet.subtract(existing, points) : points;

  let newBackward = graph.backward;
  for (const p of pointSet.toArray(toAdd)) {
    const set = pointMap.get(p, newBackward) || pointSet.from([]);
    newBackward = pointMap.set(p, pointSet.add(point, set), newBackward);
  }
  if (existing) {
    const toRemove = pointSet.subtract(points, existing);
    for (const p of pointSet.toArray(toRemove)) {
      const set = pointMap.get(p, newBackward);
      if (!set) {
        continue;
      }
      const newSet = pointSet.remove(point, set);
      if (pointSet.size(newSet) === 0) {
        newBackward = pointMap.unset(p, newBackward);
      } else {
        newBackward = pointMap.set(p, newSet, newBackward);
      }
    }
  }
  return {
    forward: newForward,
    backward: newBackward,
  };
}

export function getBackwards(
  point: Point,
  graph: PointGraph
): pointSet.PointSet {
  return pointMap.get(point, graph.backward) || pointSet.from([]);
}

export function* getBackwardsRecursive(
  point: Point,
  graph: PointGraph
): Generator<Point> {
  // Create a stack to store the points to visit
  const stack: Point[] = [point];

  // While there are points to visit, pop the top point and add its dependents to the stack
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) {
      continue;
    }

    // Get the set of points that depend on the current point
    const backwardDependencies = pointMap.get(current, graph.backward);

    // If there are no dependents, skip to the next point
    if (!backwardDependencies) {
      continue;
    }

    // Otherwise, add the dependents to the stack if they have not yet been visited
    for (const dependent of pointSet.entries(backwardDependencies)) {
      yield dependent;
      stack.push(dependent);
    }
  }
}

export function hasCircularDependency(
  graph: PointGraph,
  startPoint: Point
): boolean {
  let visited = pointSet.from([]);
  const stack: Point[] = [startPoint];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) {
      continue;
    }

    if (pointSet.has(visited, current)) {
      return true;
    }

    visited = pointSet.add(current, visited);

    const dependents = pointMap.get(current, graph.forward);

    if (!dependents) {
      continue;
    }

    for (const dependent of pointSet.entries(dependents)) {
      stack.push(dependent);
    }
  }

  return false;
}

export function* traverseBFS(graph: PointGraph): Generator<Point> {
  // Create a Set to store the points that have been visited
  let visited = pointSet.from([]);

  // Create a queue to store the points that still need to be visited
  const queue: Point[] = [];

  // Iterate over all the points in the forward map and add the ones with no dependencies to the queue
  for (const [point, dependencies] of pointMap.entries(graph.forward)) {
    if (pointSet.size(dependencies) === 0 && !pointSet.has(visited, point)) {
      queue.push(point);
      visited = pointSet.add(point, visited);
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
    const dependents = pointMap.get(point, graph.forward);

    // If there are no dependents, skip to the next iteration
    if (!dependents) {
      continue;
    }

    // Otherwise, add the dependents to the queue if they have not yet been visited
    for (const dependent of pointSet.entries(dependents)) {
      if (!pointSet.has(visited, dependent)) {
        queue.push(dependent);
        visited = pointSet.add(dependent, visited);
      }
    }
  }
}
