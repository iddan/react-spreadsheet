import { createAction } from "@reduxjs/toolkit";
import * as Matrix from "./matrix";
import * as Point from "./point";
import * as Types from "./types";

export const setData = createAction<
  (data: Matrix.Matrix<Types.CellBase>) => {
    payload: { data: Matrix.Matrix<Types.CellBase> };
  },
  "SET_DATA"
>("SET_DATA", (data) => ({ payload: { data } }));
export const selectEntireRow = createAction<
  (
    row: number,
    extend: boolean
  ) => { payload: { row: number; extend: boolean } },
  "SELECT_ENTIRE_ROW"
>("SELECT_ENTIRE_ROW", (row, extend) => ({ payload: { row, extend } }));
export const selectEntireColumn = createAction<
  (
    column: number,
    extend: boolean
  ) => { payload: { column: number; extend: boolean } },
  "SELECT_ENTIRE_COLUMN"
>("SELECT_ENTIRE_COLUMN", (column, extend) => ({
  payload: { column, extend },
}));
export const selectEntireTable = createAction("SELECT_ENTIRE_TABLE");
export const select = createAction<
  (point: Point.Point) => { payload: { point: Point.Point } },
  "SELECT"
>("SELECT", (point) => ({ payload: { point } }));
export const activate = createAction<
  (point: Point.Point) => { payload: { point: Point.Point } },
  "ACTIVATE"
>("ACTIVATE", (point) => ({ payload: { point } }));
export const setCellData = createAction<
  (
    active: Point.Point,
    data: Types.CellBase,
    getBindingsForCell: Types.GetBindingsForCell
  ) => {
    payload: {
      active: Point.Point;
      data: Types.CellBase;
      getBindingsForCell: Types.GetBindingsForCell;
    };
  },
  "SET_CELL_DATA"
>("SET_CELL_DATA", (active, data, getBindingsForCell) => ({
  payload: { active, data, getBindingsForCell },
}));
export const setCellDimensions = createAction<
  (
    point: Point.Point,
    dimensions: Types.Dimensions
  ) => {
    payload: { point: Point.Point; dimensions: Types.Dimensions };
  },
  "SET_CELL_DIMENSIONS"
>("SET_CELL_DIMENSIONS", (point, dimensions) => ({
  payload: { point, dimensions },
}));
export const copy = createAction("COPY");
export const cut = createAction("CUT");
export const paste = createAction<
  (data: string) => { payload: { data: string } },
  "PASTE"
>("PASTE", (data) => ({ payload: { data } }));
export const edit = createAction("EDIT");
export const view = createAction("VIEW");
export const clear = createAction("CLEAR");
export const blur = createAction("BLUR");
export const keyPress = createAction<
  (event: React.KeyboardEvent) => { payload: { event: React.KeyboardEvent } },
  "KEY_PRESS"
>("KEY_PRESS", (event) => ({ payload: { event } }));
export const keyDown = createAction<
  (event: React.KeyboardEvent) => { payload: { event: React.KeyboardEvent } },
  "KEY_DOWN"
>("KEY_DOWN", (event) => ({ payload: { event } }));
export const dragStart = createAction("DRAG_START");
export const dragEnd = createAction("DRAG_END");
export const commit = createAction<
  (changes: Types.CommitChanges) => {
    payload: { changes: Types.CommitChanges };
  },
  "COMMIT"
>("COMMIT", (changes) => ({ payload: { changes } }));
