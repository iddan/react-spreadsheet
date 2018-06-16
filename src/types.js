// @flow

import type { ComponentType } from "react";
import type { PointMap } from "./point-map";
import type { PointSet } from "./point-set";
import type { Matrix } from "./matrix";

export type Point = {|
  column: number,
  row: number
|};

export type CellDescriptor<Cell> = {|
  ...Point,
  data: ?Cell
|};

export type Mode = "view" | "edit";

export type Dimensions = {|
  width: number,
  height: number,
  top: number,
  left: number
|};

export type StoreState<Cell> = {|
  data: Matrix<Cell>,
  selected: PointSet,
  copied: PointMap<Cell>,
  hasPasted: boolean,
  cut: boolean,
  active: Point | null,
  mode: Mode,
  cellDimensions: PointMap<Dimensions>,
  bindings: PointMap<PointSet>
|};

export type getValue<Cell, Value> = (CellDescriptor<Cell>) => Value;

export type getBindingsForCell<Cell> = (
  CellDescriptor<Cell>,
  Matrix<Cell>
) => Point[];

export type CellComponentProps<Cell, Value> = {|
  ...Point,
  cell: ?Cell,
  getValue: getValue<Cell, Value>
|};

export type DataViewer<Cell, Value> = ComponentType<
  CellComponentProps<Cell, Value>
>;

export type DataEditorProps<Cell, Value> = {|
  ...CellComponentProps<Cell, Value>,
  onChange: Cell => void
|};

export type DataEditor<Cell, Value> = ComponentType<
  DataEditorProps<Cell, Value>
>;
