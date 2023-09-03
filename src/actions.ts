import { Matrix } from "./matrix";
import { Point } from "./point";
import { CellBase, Dimensions, CommitChanges } from "./types";
import FormulaParser from "fast-formula-parser";

export const SET_DATA = "SET_DATA";
export const SELECT_ENTIRE_ROW = "SELECT_ENTIRE_ROW";
export const SELECT_ENTIRE_COLUMN = "SELECT_ENTIRE_COLUMN";
export const SELECT_ENTIRE_WORKSHEET = "SELECT_ENTIRE_WORKSHEET";
export const SELECT = "SELECT";
export const ACTIVATE = "ACTIVATE";
export const SET_CELL_DATA = "SET_CELL_DATA";
export const SET_CELL_DIMENSIONS = "SET_CELL_DIMENSIONS";
export const COPY = "COPY";
export const CUT = "CUT";
export const PASTE = "PASTE";
export const EDIT = "EDIT";
export const VIEW = "VIEW";
export const CLEAR = "CLEAR";
export const BLUR = "BLUR";
export const KEY_PRESS = "KEY_PRESS";
export const KEY_DOWN = "KEY_DOWN";
export const DRAG_START = "DRAG_START";
export const DRAG_END = "DRAG_END";
export const COMMIT = "COMMIT";

export type BaseAction<T extends string> = {
  type: T;
};

export type SetDataAction = BaseAction<typeof SET_DATA> & {
  payload: {
    data: Matrix<CellBase>;
  };
};

export function setData(data: Matrix<CellBase>): SetDataAction {
  return {
    type: SET_DATA,
    payload: { data },
  };
}

export type SelectEntireRowAction = BaseAction<typeof SELECT_ENTIRE_ROW> & {
  payload: {
    row: number;
    extend: boolean;
  };
};

export function selectEntireRow(
  row: number,
  extend: boolean
): SelectEntireRowAction {
  return {
    type: SELECT_ENTIRE_ROW,
    payload: { row, extend },
  };
}

export type SelectEntireColumnAction = BaseAction<
  typeof SELECT_ENTIRE_COLUMN
> & {
  payload: {
    column: number;
    extend: boolean;
  };
};

export function selectEntireColumn(
  column: number,
  extend: boolean
): SelectEntireColumnAction {
  return {
    type: SELECT_ENTIRE_COLUMN,
    payload: { column, extend },
  };
}

export type SelectEntireWorksheetAction = BaseAction<
  typeof SELECT_ENTIRE_WORKSHEET
>;

export function selectEntireWorksheet(): SelectEntireWorksheetAction {
  return { type: SELECT_ENTIRE_WORKSHEET };
}

export type SelectAction = BaseAction<typeof SELECT> & {
  payload: {
    point: Point;
  };
};

export function select(point: Point): SelectAction {
  return {
    type: SELECT,
    payload: { point },
  };
}

export type ActivateAction = BaseAction<typeof ACTIVATE> & {
  payload: {
    point: Point;
  };
};

export function activate(point: Point): ActivateAction {
  return {
    type: ACTIVATE,
    payload: { point },
  };
}

export type SetCellDataAction = BaseAction<typeof SET_CELL_DATA> & {
  payload: {
    active: Point;
    data: CellBase;
    parserConstructor?: (getData: () => Matrix<CellBase>) => FormulaParser;
  };
};

export function setCellData(
  active: Point,
  data: CellBase,
  parserConstructor?: (getData: () => Matrix<CellBase>) => FormulaParser
): SetCellDataAction {
  return {
    type: SET_CELL_DATA,
    payload: { active, data, parserConstructor },
  };
}

export type SetCellDimensionsAction = BaseAction<typeof SET_CELL_DIMENSIONS> & {
  payload: {
    point: Point;
    dimensions: Dimensions;
  };
};

export function setCellDimensions(
  point: Point,
  dimensions: Dimensions
): SetCellDimensionsAction {
  return {
    type: SET_CELL_DIMENSIONS,
    payload: { point, dimensions },
  };
}

export type PasteAction = BaseAction<typeof PASTE> & {
  payload: {
    data: string;
  };
};

export function paste(data: string): PasteAction {
  return {
    type: PASTE,
    payload: { data },
  };
}

export type KeyPressAction = BaseAction<typeof KEY_PRESS> & {
  payload: {
    event: React.KeyboardEvent;
  };
};

export function keyPress(event: React.KeyboardEvent): KeyPressAction {
  return {
    type: KEY_PRESS,
    payload: { event },
  };
}

export type KeyDownAction = BaseAction<typeof KEY_DOWN> & {
  payload: {
    event: React.KeyboardEvent;
  };
};

export function keyDown(event: React.KeyboardEvent): KeyDownAction {
  return {
    type: KEY_DOWN,
    payload: { event },
  };
}

export type DragStartAction = BaseAction<typeof DRAG_START>;

export function dragStart(): DragStartAction {
  return { type: DRAG_START };
}

export type DragEndAction = BaseAction<typeof DRAG_END>;

export function dragEnd(): DragEndAction {
  return { type: DRAG_END };
}

export type CommitAction = BaseAction<typeof COMMIT> & {
  payload: {
    changes: CommitChanges;
  };
};

export function commit(changes: CommitChanges): CommitAction {
  return {
    type: COMMIT,
    payload: { changes },
  };
}

export type CopyAction = BaseAction<typeof COPY>;

export function copy(): CopyAction {
  return { type: COPY };
}

export type CutAction = BaseAction<typeof CUT>;

export function cut(): CutAction {
  return { type: CUT };
}

export type EditAction = BaseAction<typeof EDIT>;

export function edit(): EditAction {
  return { type: EDIT };
}

export type ViewAction = BaseAction<typeof VIEW>;

export function view(): ViewAction {
  return { type: VIEW };
}

export type ClearAction = BaseAction<typeof CLEAR>;

export function clear(): ClearAction {
  return { type: CLEAR };
}

export type BlurAction = BaseAction<typeof BLUR>;

export function blur(): BlurAction {
  return { type: BLUR };
}

export type Action =
  | SetDataAction
  | SelectEntireRowAction
  | SelectEntireColumnAction
  | SelectEntireWorksheetAction
  | SelectAction
  | ActivateAction
  | SetCellDataAction
  | SetCellDimensionsAction
  | PasteAction
  | KeyPressAction
  | KeyDownAction
  | DragStartAction
  | DragEndAction
  | CommitAction
  | CopyAction
  | CutAction
  | EditAction
  | ViewAction
  | ClearAction
  | BlurAction;
