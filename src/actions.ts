import { createAction } from "@reduxjs/toolkit";
import * as Matrix from "./matrix";
import * as Point from "./point";
import * as Types from "./types";

export const setData = createAction<
  { data: Matrix.Matrix<Types.CellBase> },
  "SET_DATA"
>("SET_DATA");
export const select = createAction<{ point: Point.Point }, "SELECT">("SELECT");
export const activate = createAction<{ point: Point.Point }, "ACTIVATE">(
  "ACTIVATE"
);
export const setCellData = createAction<
  {
    active: Point.Point;
    data: Types.CellBase;
    bindings: Point.Point[];
  },
  "SET_CELL_DATA"
>("SET_CELL_DATA");
export const setCellDimensions = createAction<
  {
    point: Point.Point;
    dimensions: Types.Dimensions;
  },
  "SET_CELL_DIMENSIONS"
>("SET_CELL_DIMENSIONS");
export const copy = createAction("COPY");
export const cut = createAction("CUT");
export const paste = createAction<{ data: string }, "PASTE">("PASTE");
export const edit = createAction("EDIT");
export const view = createAction("VIEW");
export const clear = createAction("CLEAR");
export const blur = createAction("BLUR");
export const keyPress = createAction<
  { event: React.KeyboardEvent },
  "KEY_PRESS"
>("KEY_PRESS");
export const keyDown = createAction<{ event: React.KeyboardEvent }, "KEY_DOWN">(
  "KEY_DOWN"
);
export const dragStart = createAction("DRAG_START");
export const dragEnd = createAction("DRAG_END");
export const commit = createAction<
  {
    changes: Types.CommitChanges;
  },
  "COMMIT"
>("COMMIT");
