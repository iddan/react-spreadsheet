// @flow
import * as PointSet from "./point-set";
import * as PointMap from "./point-map";
import * as Matrix from "./matrix";
import * as Types from "./types";
import { isActive, setCell } from "./util";

type Action = <Cell>(
  state: Types.StoreState<Cell>,
  ...*
) => $Shape<Types.StoreState<Cell>>;

export const select: Action = (state, cellPointer: Types.Point) => {
  if (state.active && !isActive(state.active, cellPointer)) {
    return {
      selected: PointSet.from(
        Matrix.range(
          { row: state.active.row - 1, column: state.active.column - 1 },
          {
            row: cellPointer.row,
            column: cellPointer.column
          }
        )
      ),
      mode: "view"
    };
  }
  return null;
};

export const activate: Action = (state, cellPointer: Types.Point) => ({
  selected: PointSet.from([cellPointer]),
  active: cellPointer,
  mode: isActive(state.active, cellPointer) ? "edit" : "view"
});

export const setData: Action = (state, data: *) => ({
  mode: "edit",
  data: setCell(state, data)
});

function setter<Cell>(key: $Keys<Types.StoreState<Cell>>) {
  return (state: Types.StoreState<Cell>, value: *) => ({
    [key]: value
  });
}

export const setTableDimensions = setter("tableDimensions");

export function setCellDimensions(
  state: Types.StoreState<*>,
  point: Types.Point,
  dimensions: Types.Dimensions
) {
  const prevDimensions = PointMap.get(point, state.cellDimensions);
  if (
    prevDimensions &&
    prevDimensions.width === dimensions.width &&
    prevDimensions.height === dimensions.height &&
    prevDimensions.top === dimensions.top &&
    prevDimensions.left === dimensions.left
  ) {
    return null;
  }
  return {
    cellDimensions: PointMap.set(point, dimensions, state.cellDimensions)
  };
}
