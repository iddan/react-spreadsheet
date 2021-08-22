import { ComponentType } from "react";
import { Parser as FormulaParser } from "hot-formula-parser";
import { PointMap } from "./point-map";
import { PointSet } from "./point-set";
import { Matrix } from "./matrix";
import { PointRange } from "./point-range";

export type Point = {
  column: number;
  row: number;
};

/** The base type of cell data in Spreadsheet */
export type CellBase<Value = any> = {
  /** Whether the cell should not be editable */
  readOnly?: boolean;
  /** Class to be given for the cell element */
  className?: string;
  /** The value of the cell */
  value: Value;
  /** Custom component to render when the cell is edited, if not defined would default to the component defind for the Spreadsheet */
  DataEditor?: DataEditorComponent<CellBase<Value>>;
  /** Custom component to render when the cell is viewed, if not defined would default to the component defind for the Spreadsheet */
  DataViewer?: DataViewerComponent<CellBase<Value>>;
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

export type StoreState<Cell extends CellBase = CellBase<any>> = {
  data: Matrix<Cell>;
  selected: PointRange | null;
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

export type GetBindingsForCell<Cell> = (
  cell: Cell,
  data: Matrix<Cell>
) => Point[];

type CellChange<Cell> = {
  prevCell: Cell | null;
  nextCell: Cell | null;
};

export type commit<Cell> = (changes: CellChange<Cell>[]) => void;

/** Type of Spreadsheet Cell component props */
export type CellComponentProps<Cell extends CellBase> = {
  /** The row of the cell */
  row: number;
  /** The column of the cell */
  column: number;
  /** The DataViewer component to be used by the cell */
  DataViewer: DataViewerComponent<Cell>;
  /** The FormulaParser instance to be used by the cell */
  formulaParser: FormulaParser;
  /** Whether the cell is selected */
  selected: boolean;
  /** Whether the cell is active */
  active: boolean;
  /** Whether the cell is copied */
  copied: boolean;
  /** Whether the user is dragging */
  dragging: boolean;
  /** The mode of the cell */
  mode: Mode;
  /** The data of the cell */
  data: Cell | undefined;
  /** Select the cell at the given pointer */
  select: (cellPointer: Point) => void;
  /** Activate the cell at the given pointer */
  activate: (cellPointer: Point) => void;
  /** Set the dimensions of the cell at the given point with the given dimensions */
  setCellDimensions: (point: Point, dimensions: Dimensions) => void;
};

/** Type of the Spreadsheet Cell component */
export type CellComponent<Cell extends CellBase = CellBase> = ComponentType<
  CellComponentProps<Cell>
>;

type DataComponentProps<Cell extends CellBase> = {
  cell: Cell | undefined;
} & Point;

/** Type of the Spreadsheet DataViewer component props */
export type DataViewerProps<Cell extends CellBase> =
  DataComponentProps<Cell> & {
    formulaParser: FormulaParser;
  };

/** Type of the Spreadsheet DataViewer component */
export type DataViewerComponent<Cell extends CellBase = CellBase> =
  ComponentType<DataViewerProps<Cell>>;

/** Type of the Spreadsheet DataEditor component props */
export type DataEditorProps<Cell extends CellBase> =
  DataComponentProps<Cell> & {
    onChange: (cell: Cell) => void;
  };

/** Type of the Spreadsheet DataEditor component */
export type DataEditorComponent<Cell extends CellBase = CellBase> =
  ComponentType<DataEditorProps<Cell>>;
