/** Adapter of actions and reducer to Unistore format */

import * as Matrix from "./matrix";
import * as Point from "./point";
import * as Types from "./types";
import * as Actions from "./actions";
import { reducer } from "./reducer";

export const setData = (
  state: Types.StoreState,
  data: Matrix.Matrix<Types.CellBase>
): Types.StoreState => {
  const action = Actions.setData({ data });
  return reducer(state, action);
};

export const select = (
  state: Types.StoreState,
  point: Point.Point
): Types.StoreState => {
  const action = Actions.select({ point });
  return reducer(state, action);
};

export const activate = (
  state: Types.StoreState,
  point: Point.Point
): Types.StoreState => {
  const action = Actions.activate({ point });
  return reducer(state, action);
};

export const setCellData = (
  state: Types.StoreState,
  active: Point.Point,
  data: Types.CellBase,
  bindings: Point.Point[]
): Types.StoreState => {
  const action = Actions.setCellData({ active, data, bindings });
  return reducer(state, action);
};

export const setCellDimensions = (
  state: Types.StoreState,
  point: Point.Point,
  dimensions: Types.Dimensions
): Types.StoreState => {
  const action = Actions.setCellDimensions({ point, dimensions });
  return reducer(state, action);
};

export const copy = (state: Types.StoreState): Types.StoreState => {
  const action = Actions.copy();
  return reducer(state, action);
};

export const cut = (state: Types.StoreState): Types.StoreState => {
  const action = Actions.cut();
  return reducer(state, action);
};

export const paste = (
  state: Types.StoreState,
  data: string
): Types.StoreState => {
  const action = Actions.paste({ data });
  return reducer(state, action);
};

export const edit = (state: Types.StoreState): Types.StoreState => {
  const action = Actions.edit();
  return reducer(state, action);
};

export const view = (state: Types.StoreState): Types.StoreState => {
  const action = Actions.view();
  return reducer(state, action);
};

export const clear = (state: Types.StoreState): Types.StoreState => {
  const action = Actions.clear();
  return reducer(state, action);
};

export const blur = (state: Types.StoreState): Types.StoreState => {
  const action = Actions.blur();
  return reducer(state, action);
};

export const keyPress = (
  state: Types.StoreState,
  event: React.KeyboardEvent
): Types.StoreState => {
  const action = Actions.keyPress({ event });
  return reducer(state, action);
};

export const keyDown = (
  state: Types.StoreState,
  event: React.KeyboardEvent
): Types.StoreState => {
  const action = Actions.keyDown({ event });
  return reducer(state, action);
};

export const dragStart = (state: Types.StoreState): Types.StoreState => {
  const action = Actions.dragStart();
  return reducer(state, action);
};

export const dragEnd = (state: Types.StoreState): Types.StoreState => {
  const action = Actions.dragEnd();
  return reducer(state, action);
};

export const commit = (
  state: Types.StoreState,
  changes: Types.CommitChanges
): Types.StoreState => {
  const action = Actions.commit({ changes });
  return reducer(state, action);
};
