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
        Matrix.inclusiveRange(
          { row: cellPointer.row, column: cellPointer.column },
          { row: state.active.row, column: state.active.column }
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

export const copy = (state: Types.StoreState<*>) => ({
  copied: state.selected,
  cut: false,
  hasPasted: false
});

export const cut = (state: Types.StoreState<*>) => ({
  ...copy(state),
  cut: true
});

export const paste = (state: Types.StoreState<*>) => {
  const minRow = PointSet.getEdgeValue(state.copied, "row", -1);
  const minColumn = PointSet.getEdgeValue(state.copied, "column", -1);

  type Accumulator = {|
    data: typeof state.data,
    selected: typeof state.selected
  |};

  const { data, selected } = PointSet.reduce(
    (acc: Accumulator, { row, column }): Accumulator => {
      const nextRow = row - minRow + state.active.row;
      const nextColumn = column - minColumn + state.active.column;

      const nextData = state.cut
        ? Matrix.unset(row, column, acc.data)
        : acc.data;

      console.log(nextData);

      if (!Matrix.has(nextRow, nextColumn, state.data)) {
        return { data: nextData, selected: acc.selected };
      }

      return {
        data: Matrix.set(
          nextRow,
          nextColumn,
          Matrix.get(row, column, state.data),
          nextData
        ),
        selected: PointSet.add(acc.selected, {
          row: nextRow,
          column: nextColumn
        })
      };
    },
    state.copied,
    { data: state.data, selected: PointSet.from([]) }
  );
  return {
    data,
    selected,
    cut: false,
    hasPasted: true,
    mode: "view"
  };
};
