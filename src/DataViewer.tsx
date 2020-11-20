import * as React from "react";
import { ComponentType, ReactNode } from "react";
import { Parser as FormulaParser } from "hot-formula-parser";
import * as Types from "./types";
import { getComputedValue } from "./util";

const toView = (value: React.ReactNode | boolean): React.ReactNode => {
  if (value === false) {
    return <div className="Spreadsheet__data-viewer--boolean">FALSE</div>;
  }
  if (value === true) {
    return <div className="Spreadsheet__data-viewer--boolean">TRUE</div>;
  }
  return value;
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
