import { Point } from "./point";
import * as PointMap from "./point-map";
import * as PointSet from "./point-set";

/** The bindings between the cells in the spreadsheet*/
export type Bindings = {
  cellToDependents: PointMap.PointMap<PointSet.PointSet>;
  cellToDependencies: PointMap.PointMap<PointSet.PointSet>;
};

export function create(): Bindings {
  return {
    cellToDependents: PointMap.from([]),
    cellToDependencies: PointMap.from([]),
  };
}

/** Set the dependencies for a cell */
export function setDependencies(
  bindings: Bindings,
  cellPoint: Point,
  dependencies: PointSet.PointSet
): Bindings {
  const previousDependencies =
    PointMap.get(cellPoint, bindings.cellToDependencies) || PointSet.from([]);
  const addedDependencies = PointSet.difference(
    dependencies,
    previousDependencies
  );
  const removedDependencies = PointSet.difference(
    previousDependencies,
    dependencies
  );
  const updatedCellToDependencies = PointMap.set(
    cellPoint,
    dependencies,
    bindings.cellToDependencies
  );
  const updatedCellToDependentsWithAdded = PointSet.reduce(
    addedDependencies,
    (cellToDependents, dependency) => {
      const existingPoints =
        PointMap.get(dependency, cellToDependents) || PointSet.from([]);
      return PointMap.set(
        dependency,
        PointSet.add(existingPoints, cellPoint),
        cellToDependents
      );
    },
    bindings.cellToDependents
  );
  const updatedCellToDependentsWithAddedWithoutRemoved = PointSet.reduce(
    removedDependencies,
    (cellToDependents, dependency) => {
      const existingPoints =
        PointMap.get(dependency, cellToDependents) || PointSet.from([]);
      return PointMap.set(
        dependency,
        PointSet.remove(existingPoints, cellPoint),
        cellToDependents
      );
    },
    updatedCellToDependentsWithAdded
  );
  return {
    cellToDependencies: updatedCellToDependencies,
    cellToDependents: updatedCellToDependentsWithAddedWithoutRemoved,
  };
}

/** Get the cells depending on the given cell */
export function getDependents(
  bindings: Bindings,
  cellPoint: Point
): PointSet.PointSet {
  return (
    PointMap.get(cellPoint, bindings.cellToDependents) || PointSet.from([])
  );
}
