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
