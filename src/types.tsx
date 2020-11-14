import { ComponentType } from "react";
import { PointMap } from "./point-map";
import { PointSet } from "./point-set";
import { Matrix } from "./matrix";

export type Point = {
  column: number;
  row: number;
};

export type CellBase = {
  readOnly?: boolean;
  className?: string;
  DataViewer?: DataViewer<unknown, unknown>;
  DataEditor?: DataEditor<unknown, unknown>;
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

export type StoreState<Cell extends CellBase> = {
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

export type getValue<Cell, Value> = (
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

export type CellComponentProps<Cell, Value> = {
  cell: Cell | null;
  getValue: getValue<Cell, Value>;
} & Point;

export type DataViewer<Cell, Value> = ComponentType<
  CellComponentProps<Cell, Value>
>;

export type DataEditorProps<Cell, Value> = CellComponentProps<Cell, Value> & {
  onChange: (cell: Cell) => void;
};

export type DataEditor<Cell, Value> = ComponentType<
  DataEditorProps<Cell, Value>
>;
