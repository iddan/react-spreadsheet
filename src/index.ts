import Spreadsheet from "./Spreadsheet";
import DataEditor from "./DataEditor";
import DataViewer from "./DataViewer";

export default Spreadsheet;
export { Spreadsheet, DataEditor, DataViewer };
export type { Props } from "./Spreadsheet";
export { getComputedValue } from "./util";
export { Matrix, createEmpty as createEmptyMatrix } from "./matrix";
export type { Point } from "./point";
export type {
  CellBase,
  CellDescriptor,
  Mode,
  Dimensions,
  GetBindingsForCell,
  CellChange,
  CellComponentProps,
  CellComponent,
  DataViewerProps,
  DataViewerComponent,
  DataEditorProps,
  DataEditorComponent,
  ColumnIndicatorComponent,
  ColumnIndicatorProps,
  RowIndicatorComponent,
  RowIndicatorProps,
  CornerIndicatorComponent,
  CornerIndicatorProps,
  RowComponent,
  RowProps,
  TableComponent,
  TableProps,
  HeaderRowProps,
  HeaderRowComponent,
} from "./types";
