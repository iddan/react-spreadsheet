// @flow

import type { ComponentType } from "react";
import type { Type as Selected } from "./selected";

export type CellPointer = {
  column: number,
  row: number
};

export type CellDescriptor<Cell> = {
  ...CellPointer,
  data: Cell
};

export type Mode = "view" | "edit";

export type Data<Cell> = Cell[][];

export type StoreState<Cell> = {|
  data: Data<Cell>,
  selected: Selected,
  active: CellPointer | null,
  mode: Mode
|};

export type getValue<Cell, Value> = (CellDescriptor<Cell>) => Value;

export type CellComponentProps<Cell, Value> = {
  ...CellPointer,
  cell: Cell,
  getValue: getValue<Cell, Value>
};

export type DataViewer<Cell, Value> = ComponentType<
  CellComponentProps<Cell, Value>
>;

export type DataEditorProps<Cell, Value> = {
  ...CellComponentProps<Cell, Value>,
  onChange: Cell => void
};

export type DataEditor<Cell, Value> = ComponentType<
  DataEditorProps<Cell, Value>
>;
