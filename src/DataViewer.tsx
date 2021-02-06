import * as React from "react";
import * as Types from "./types";
import { getComputedValue } from "./util";

const toView = (value: React.ReactNode | boolean): React.ReactElement => {
  if (value === false) {
    return <span className="Spreadsheet__data-viewer--boolean">FALSE</span>;
  }
  if (value === true) {
    return <span className="Spreadsheet__data-viewer--boolean">TRUE</span>;
  }
  return <span className="Spreadsheet__data-viewer">{value}</span>;
};

const DataViewer = <Cell extends Types.CellBase>({
  cell,
  formulaParser,
}: Types.DataViewerProps<Cell>): React.ReactElement => {
  return toView(getComputedValue({ cell, formulaParser }));
};

export default DataViewer;
