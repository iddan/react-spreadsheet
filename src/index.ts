import Spreadsheet from "./Spreadsheet";
import DataEditor from "./DataEditor";
import DataViewer from "./DataViewer";

export default Spreadsheet;
export { Spreadsheet, DataEditor, DataViewer };
export type { Props } from "./Spreadsheet";
export { createEmptyMatrix, getComputedValue } from "./util";
export type { Matrix } from "./matrix";
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
} from "./types";
