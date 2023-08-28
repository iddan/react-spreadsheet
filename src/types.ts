import * as React from "react";
import { Point } from "./point";
import { Selection } from "./selection";
import { Model } from "./engine";
import { PointRange } from "./point-range";
import { Matrix } from "./matrix";
import FormulaParser from "fast-formula-parser";

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
  model: Model<Cell>;
  selected: Selection;
  copied: PointRange | null;
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
  lastCommit: null | CellChange<Cell>[];
};

export type CellChange<Cell extends CellBase = CellBase> = {
  prevCell: Cell | null;
  nextCell: Cell | null;
};

/** Type of Spreadsheet Cell component props */
export type CellComponentProps<Cell extends CellBase = CellBase> = {
  /** The row of the cell */
  row: number;
  /** The column of the cell */
  column: number;
  /** The DataViewer component to be used by the cell */
  DataViewer: DataViewerComponent<Cell>;
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
  /** The evaluated data of the cell */
  evaluatedData: Cell | undefined;
  /** Select the cell at the given point */
  select: (point: Point) => void;
  /** Activate the cell at the given point */
  activate: (point: Point) => void;
  /** Set the dimensions of the cell at the given point with the given dimensions */
  setCellDimensions: (point: Point, dimensions: Dimensions) => void;
  /** Set data of the cell */
  setCellData: (cell: Cell) => void;
  /** Constructor for the formula parser to be used */
  parserConstructor?: (getData: () => Matrix<CellBase>) => FormulaParser
};

/** Type of the Spreadsheet Cell component */
export type CellComponent<Cell extends CellBase = CellBase> =
  React.ComponentType<CellComponentProps<Cell>>;

type DataComponentProps<Cell extends CellBase> = {
  /** The rendered cell by the component */
  cell: Cell | undefined;
} & Point;

/** Type of the Spreadsheet DataViewer component props */
export type DataViewerProps<Cell extends CellBase = CellBase> =
  DataComponentProps<Cell> & {
    /** Set data of the cell */
    setCellData: (cell: Cell) => void;
    evaluatedCell: Cell | undefined;
  };

/** Type of the Spreadsheet DataViewer component */
export type DataViewerComponent<Cell extends CellBase = CellBase> =
  React.ComponentType<DataViewerProps<Cell>>;

/** Type of the Spreadsheet DataEditor component props */
export type DataEditorProps<Cell extends CellBase = CellBase> =
  DataComponentProps<Cell> & {
    /** Callback to be called when the cell's value is changed */
    onChange: (cell: Cell) => void;
    /** Callback to be called when edit mode should be exited */
    exitEditMode: () => void;
  };

/** Type of the Spreadsheet DataEditor component */
export type DataEditorComponent<Cell extends CellBase = CellBase> =
  React.ComponentType<DataEditorProps<Cell>>;

/** Type of the Spreadsheet Table component props */
export type TableProps = React.PropsWithChildren<{
  /** Numebr of columns the table should render */
  columns: number;
  /** Whether column indicators are hidden */
  hideColumnIndicators?: boolean | null;
}>;

/** Type of the Spreadsheet Table component */
export type TableComponent = React.ComponentType<TableProps>;

/** Type of the Spreadsheet Row component props */
export type RowProps = React.PropsWithChildren<{
  /** The row index of the table */
  row: number;
}>;

/** Type of the Row component */
export type RowComponent = React.ComponentType<RowProps>;

/** Type of the Spreadsheet HeaderRow component props */
export type HeaderRowProps = React.PropsWithChildren<{}>;

/** Type of the HeaderRow component */
export type HeaderRowComponent = React.ComponentType<HeaderRowProps>;

/** Type of the Spreadsheet RowIndicator component props */
export type RowIndicatorProps = {
  /** The row the indicator indicates */
  row: number;
  /** A custom label for the indicator as provided in rowLabels */
  label?: React.ReactNode | null;
  /** Whether the entire row is selected */
  selected: boolean;
  /** Callback to be called when the row is selected */
  onSelect: (row: number, extend: boolean) => void;
};

/** Type of the RowIndicator component */
export type RowIndicatorComponent = React.ComponentType<RowIndicatorProps>;

/** Type of the Spreadsheet ColumnIndicator component props */
export type ColumnIndicatorProps = {
  /** The column the indicator indicates */
  column: number;
  /** A custom label for the indicator as provided in columnLabels */
  label?: React.ReactNode | null;
  /** Whether the entire column in selected */
  selected: boolean;
  /** Callback to be called when the column is selected */
  onSelect: (column: number, extend: boolean) => void;
};

/** Type of the ColumnIndicator component */
export type ColumnIndicatorComponent =
  React.ComponentType<ColumnIndicatorProps>;

/** Type of the Spreadsheet CornerIndicator component props */
export type CornerIndicatorProps = {
  /** Whether the entire table is selected */
  selected: boolean;
  /** Callback to select the entire table */
  onSelect: () => void;
};

/** Type of the CornerIndicator component */
export type CornerIndicatorComponent =
  React.ComponentType<CornerIndicatorProps>;

export type CommitChanges<Cell extends CellBase = CellBase> = Array<{
  prevCell: Cell | null;
  nextCell: Cell | null;
}>;
