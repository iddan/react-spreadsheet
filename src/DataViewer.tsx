import * as React from "react";
import * as Types from "./types";

export const TRUE_TEXT = "TRUE";
export const FALSE_TEXT = "FALSE";

/** The default Spreadsheet DataViewer component */
const DataViewer = <Cell extends Types.CellBase<Value>, Value>({
  cell,
  evaluatedCell,
}: Types.DataViewerProps<Cell>): React.ReactElement => {
  const value = evaluatedCell?.value ?? cell?.value;

  return typeof value === "boolean" ? (
    <span className="Spreadsheet__data-viewer Spreadsheet__data-viewer--boolean">
      {convertBooleanToText(value)}
    </span>
  ) : (
    <span className="Spreadsheet__data-viewer">{value}</span>
  );
};

export default DataViewer;

export function convertBooleanToText(value: boolean): string {
  return value ? TRUE_TEXT : FALSE_TEXT;
}
