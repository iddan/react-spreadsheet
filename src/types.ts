import { ComponentType } from "react";
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
  DataViewer?: DataViewerComponent<CellBase<Value>, Value>;
  DataEditor?: DataEditorComponent<CellBase<Value>, Value>;
};

export type CellDescriptor<Cell> = {
  data: Cell | undefined;
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
  lastCommit: null | CellChange<Cell>[];
};

export type GetValue<Cell, Value> = (
  cellDescriptor: CellDescriptor<Cell>
) => Value;

export type getBindingsForCell<Cell> = (
  cell: Cell,
  data: Matrix<Cell>
) => Point[];

type CellChange<Cell> = {
  prevCell: Cell | null;
  nextCell: Cell | null;
};

export type commit<Cell> = (changes: CellChange<Cell>[]) => void;

export type CellComponentProps<Cell extends CellBase<Value>, Value> = {
  row: number;
  column: number;
  DataViewer: DataViewerComponent<Cell, Value>;
  getValue: GetValue<Cell, Value>;
  formulaParser: FormulaParser;
  selected: boolean;
  active: boolean;
  copied: boolean;
  dragging: boolean;
  mode: Mode;
  data: Cell | undefined;
  select: (cellPointer: Point) => void;
  activate: (cellPointer: Point) => void;
  setCellDimensions: (point: Point, dimensions: Dimensions) => void;
};

export type CellComponent<Cell extends CellBase<Value>, Value> = ComponentType<
  CellComponentProps<Cell, Value>
>;

export type DataComponentProps<Cell extends CellBase<Value>, Value> = {
  cell: Cell | undefined;
  getValue: GetValue<Cell, Value>;
} & Point;

export type DataViewerProps<
  Cell extends CellBase<Value>,
  Value
> = DataComponentProps<Cell, Value> & {
  formulaParser?: FormulaParser;
};

export type DataViewerComponent<
  Cell extends CellBase<Value>,
  Value
> = ComponentType<DataViewerProps<Cell, Value>>;

export type DataEditorProps<
  Cell extends CellBase<Value>,
  Value
> = DataComponentProps<Cell, Value> & {
  onChange: (cell: Cell) => void;
};

export type DataEditorComponent<
  Cell extends CellBase<Value>,
  Value
> = ComponentType<DataEditorProps<Cell, Value>>;
