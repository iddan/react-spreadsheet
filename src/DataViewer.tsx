import * as React from "react";
import * as Types from "./types";
import { getComputedValue } from "./util";

const toView = (value: React.ReactNode | boolean): React.ReactNode => {
  if (value === false) {
    return <span className="Spreadsheet__data-viewer--boolean">FALSE</span>;
  }
  if (value === true) {
    return <span className="Spreadsheet__data-viewer--boolean">TRUE</span>;
  }
  return <span className="Spreadsheet__data-viewer">{value}</span>;
};

const DataViewer = <Cell extends Types.CellBase<Value>, Value>({
  getValue,
  cell,
  column,
  row,
  formulaParser,
}: Types.DataViewerProps<Cell, Value>): React.ReactNode => {
  return toView(
    getComputedValue({ getValue, cell, column, row, formulaParser })
  );
};

export default DataViewer;
