// @flow
import * as PointSet from "./point-set";
import * as Matrix from "./matrix";
import * as Types from "./types";
import { isActive, setCell } from "./util";

type Action = <Cell>(
  state: Types.StoreState<Cell>,
  ...*
) => $Shape<Types.StoreState<Cell>>;

export const select: Action = (state, cellPointer: Types.CellPointer) => {
  if (state.active && !isActive(state.active, cellPointer)) {
    return {
      selected: PointSet.of(
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

export const activate: Action = (state, cellPointer: Types.CellPointer) => ({
  selected: PointSet.of([cellPointer]),
  active: cellPointer,
  mode: isActive(state.active, cellPointer) ? "edit" : "view"
});

export const setData: Action = (state, data: *) => ({
  mode: "edit",
  data: setCell(state, data)
});
