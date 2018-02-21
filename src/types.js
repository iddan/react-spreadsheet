// @flow

import type { ComponentType } from "react";

type CellDescriptor<CellType> = {
  cell: CellType,
  row: number,
  column: number
};

export type getValue<CellType, Value> = (CellDescriptor<CellType>) => Value;

export type CellComponentProps<CellType, Value> = {
  ...CellDescriptor<CellType>,
  getValue: getValue<CellType, Value>
};

export type DataViewer<Cell, Value> = ComponentType<
  CellComponentProps<Cell, Value>
>;

export type onChange<Value> = ({
  row: number,
  column: number,
  value: Value
}) => void;

export type DataEditor<Cell, Value> = ComponentType<{
  ...CellComponentProps<Cell, Value>,
  onChange: Value => void
}>;

export type Mode = "view" | "edit";

export type Active<Value> = {
  row: number,
  column: number,
  mode: Mode,
  value?: Value
};
