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

/** The default Spreadsheet DataViewer component */
const DataViewer = <Cell extends Types.CellBase>({
  cell,
  formulaParser,
}: Types.DataViewerProps<Cell>): React.ReactNode => {
  return toView(getComputedValue({ cell, formulaParser }));
};

export default DataViewer;
