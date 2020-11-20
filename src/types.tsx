import { ComponentType } from "react";
import { types } from "@babel/core";
import { Parser as FormulaParser } from "hot-formula-parser";
import { PointMap } from "./point-map";
import { PointSet } from "./point-set";
import { Matrix } from "./matrix";

export type Point = {
  column: number;
  row: number;
};

export type CellBase<Value> = {
  readOnly?: boolean;
  className?: string;
  DataViewer?: DataViewer<CellBase<Value>, Value>;
  DataEditor?: DataEditor<CellBase<Value>, Value>;
};

export type CellDescriptor<Cell> = {
  data: Cell | null;
} & Point;

export type Mode = "view" | "edit";

export type Dimensions = {
  width: number;
  height: number;
  top: number;
  left: number;
};

export type StoreState<Cell extends CellBase<Value>, Value> = {
  data: Matrix<Cell>;
  selected: PointSet;
  copied: PointMap<Cell>;
  hasPasted: boolean;
  cut: boolean;
  active: Point | null;
  mode: Mode;
  rowDimensions: {
    [K in number]: {
      height: number;
      top: number;
    };
  };
  columnDimensions: {
    [K in number]: {
      width: number;
      left: number;
    };
  };
  dragging: boolean;
  lastChanged: Point | null;
  bindings: PointMap<PointSet>;
  lastCommit: null | Array<{
    prevCell: Cell;
    nextCell: Cell;
  }>;
};

export type GetValue<Cell, Value> = (
  cellDescriptor: CellDescriptor<Cell>
) => Value;

export type getBindingsForCell<Cell> = (
  cell: Cell,
  data: Matrix<Cell>
) => Point[];

type CellChange<CellType> = {
  prevCell: CellType | null;
  nextCell: CellType | null;
};

export type commit<CellType> = (changes: CellChange<CellType>[]) => void;

export type CellComponentProps<Cell extends CellBase<Value>, Value> = {
  cell: Cell | null;
  getValue: GetValue<Cell, Value>;
} & Point;

export type DataViewerProps<
  Cell extends CellBase<Value>,
  Value
> = CellComponentProps<Cell, Value> & {
  formulaParser?: FormulaParser;
};

export type DataViewer<Cell extends CellBase<Value>, Value> = ComponentType<
  DataViewerProps<Cell, Value>
>;

export type DataEditorProps<
  Cell extends CellBase<Value>,
  Value
> = CellComponentProps<Cell, Value> & {
  onChange: (cell: Cell) => void;
};

export type DataEditor<Cell extends CellBase<Value>, Value> = ComponentType<
  DataEditorProps<Cell, Value>
>;
