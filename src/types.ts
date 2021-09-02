import { ComponentType } from "react";
import { Parser as FormulaParser } from "hot-formula-parser";
import { Point } from "./point";
import { PointMap } from "./point-map";
import { PointSet } from "./point-set";
import { Matrix } from "./matrix";
import { PointRange } from "./point-range";

/** The base type of cell data in Spreadsheet */
export type CellBase<Value = any> = {
  /** Whether the cell should not be editable */
  readOnly?: boolean;
  /** Class to be given for the cell element */
  className?: string;
  /** The value of the cell */
  value: Value;
  /** Custom component to render when the cell is edited, if not defined would default to the component defined for the Spreadsheet */
  DataEditor?: DataEditorComponent<CellBase<Value>>;
  /** Custom component to render when the cell is viewed, if not defined would default to the component defined for the Spreadsheet */
  DataViewer?: DataViewerComponent<CellBase<Value>>;
};

/**
 * A cell with it's coordinates
 * @deprecated the component does not use cell descriptors anymore. Instead it passes cell point and cell value explicitly.
 */
export type CellDescriptor<Cell> = {
  /** The cell's data */
  data: Cell | undefined;
} & Point;

/** The spreadsheet's write mode */
export type Mode = "view" | "edit";

/** Dimensions of an element */
export type Dimensions = {
  /** The element's width in pixels */
  width: number;
  /** The element's height in pixels */
  height: number;
  /** The distance of the element from it's container top border in pixels */
  top: number;
  /** The distance of the element from it's container left border in pixels */
  left: number;
};

export type StoreState<Cell extends CellBase = CellBase> = {
  data: Matrix<Cell>;
  selected: PointRange | null;
  copied: PointMap<Cell>;
  hasPasted: boolean;
  cut: boolean;
  active: Point | null;
  mode: Mode;
  rowDimensions: Record<number, Pick<Dimensions, "height" | "top"> | undefined>;
  columnDimensions: Record<
    number,
    Pick<Dimensions, "width" | "left"> | undefined
  >;
  dragging: boolean;
  lastChanged: Point | null;
  bindings: PointMap<PointSet>;
  lastCommit: null | CellChange<Cell>[];
};

/** Function for getting the cells the cell's value is bound to */
export type GetBindingsForCell<Cell extends CellBase = CellBase> = (
  cell: Cell,
  data: Matrix<Cell>
) => Point[];

export type CellChange<Cell extends CellBase = CellBase> = {
  prevCell: Cell | null;
  nextCell: Cell | null;
};

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
  /** The rendered cell by the component */
  cell: Cell | undefined;
} & Point;

/** Type of the Spreadsheet DataViewer component props */
export type DataViewerProps<Cell extends CellBase = CellBase> =
  DataComponentProps<Cell> & {
    /** Instance of `FormulaParser` */
    formulaParser: FormulaParser;
  };

/** Type of the Spreadsheet DataViewer component */
export type DataViewerComponent<Cell extends CellBase = CellBase> =
  ComponentType<DataViewerProps<Cell>>;

/** Type of the Spreadsheet DataEditor component props */
export type DataEditorProps<Cell extends CellBase = CellBase> =
  DataComponentProps<Cell> & {
    /** Callback to be called when the cell's value is changed */
    onChange: (cell: Cell) => void;
  };

/** Type of the Spreadsheet DataEditor component */
export type DataEditorComponent<Cell extends CellBase = CellBase> =
  ComponentType<DataEditorProps<Cell>>;
