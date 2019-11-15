import React from "react";

import { PointMap } from "./point-map";
import { PointSet } from "./point-set";
import { Matrix } from "./matrix";

export interface IPoint {
  column: number;
  row: number;
}

export type CellBase = {
  readOnly?: boolean;
  DataViewer?: DataViewer<any, any>;
  DataEditor?: DataEditor<any, any>;
};

export interface ICellDescriptor<Cell> extends IPoint {
  data?: Cell;
}

export type Mode = "view" | "edit";

export interface IDimensions {
  width: number;
  height: number;
  top: number;
  left: number;
}

export interface IStoreState<Cell> {
  data: Matrix<Cell>;
  selected: PointSet;
  copied: PointMap<Cell>;
  hasPasted: boolean;
  cut: boolean;
  active: IPoint | null;
  mode: Mode;
  rowDimensions: { [key: number]: { height: number; top: number } };
  columnDimensions: { [key: number]: { width: number; left: number } };
  dragging: boolean;
  lastChanged: IPoint | null;
  bindings: PointMap<PointSet>;
  lastCommit: null | CellChange<Cell>[];
}

export type getValue<Cell, Value> = (_: ICellDescriptor<Cell>) => Value;

export type getBindingsForCell<Cell> = (cell: Cell) => IPoint[];

type CellChange<CellType> = {
  prevCell: CellType | null;
  nextCell: CellType | null;
};

export type commit<CellType> = (changes: CellChange<CellType>[]) => void;

export interface ICellComponentProps<Cell, Value> extends IPoint {
  cell?: Cell;
  getValue: getValue<Cell, Value>;
}

export type DataViewer<Cell, Value> = React.Component<
  ICellComponentProps<Cell, Value>
>;

export type DataEditorProps<Cell, Value> = ICellComponentProps<Cell, Value> & {
  onChange: (_: Cell) => void;
};

export type DataEditor<Cell, Value> = React.Component<
  DataEditorProps<Cell, Value>
>;
