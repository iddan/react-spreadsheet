import * as React from "react";
import * as Types from "./types";
import { getComputedValue } from "./util";

export const TRUE_TEXT = "TRUE";
export const FALSE_TEXT = "FALSE";

/** The default Spreadsheet DataViewer component */
const DataViewer = <Cell extends Types.CellBase<Value>, Value>({
  cell,
  formulaParser,
}: Types.DataViewerProps<Cell>): React.ReactElement => {
  const value = getComputedValue<Cell, Value>({ cell, formulaParser });
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
