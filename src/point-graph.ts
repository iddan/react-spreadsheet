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
  const existing = pointMap.get(point, graph.forward);
  const toAdd = existing ? pointSet.subtract(existing, points) : points;

  let backward = graph.backward;
  for (const p of pointSet.toArray(toAdd)) {
    const set = pointMap.get(p, backward) || pointSet.from([]);
    backward = pointMap.set(p, pointSet.add(point, set), backward);
  }
  if (existing) {
    const toRemove = pointSet.subtract(points, existing);
    for (const p of pointSet.toArray(toRemove)) {
      const set = pointMap.get(p, backward);
      if (!set) {
        continue;
      }
      const newSet = pointSet.remove(point, set);
      if (pointSet.size(newSet) === 0) {
        backward = pointMap.unset(p, backward);
      } else {
        backward = pointMap.set(p, newSet, backward);
      }
    }
  }
  return {
    forward:
      pointSet.size(points) === 0
        ? pointMap.unset(point, graph.forward)
        : pointMap.set(point, points, graph.forward),
    backward,
  };
}

export function getBackwards(
  point: Point,
  graph: PointGraph
): pointSet.PointSet {
  return pointMap.get(point, graph.backward) || pointSet.from([]);
}

export function* traverseBFS(graph: PointGraph): Generator<Point> {
  // Create a Set to store the points that have been visited
  const visited = new Set<Point>();

  // Create a queue to store the points that still need to be visited
  const queue: Point[] = [];

  // Iterate over all the points in the forward map and add the ones with no dependencies to the queue
  for (const [point, dependencies] of pointMap.entries(graph.forward)) {
    if (pointSet.size(dependencies) === 0 && !visited.has(point)) {
      queue.push(point);
      visited.add(point);
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
      if (!visited.has(dependent)) {
        queue.push(dependent);
        visited.add(dependent);
      }
    }
  }
}
