import React from "react";
import { ComponentType, ReactNode } from "react";
import { Parser as FormulaParser } from "hot-formula-parser";
import * as Types from "./types";
import { getComputedValue } from "./util";

type Cell = {
  component?: ComponentType<{
    row: number;
    column: number;
    value: ReactNode;
  }>;
};

type Props = Types.CellComponentProps<Cell, string> & {
  formulaParser: FormulaParser;
};

const toView = (value: Node | boolean): Node => {
  if (value === false) {
    return <div className="Spreadsheet__data-viewer--boolean">FALSE</div>;
  }
  if (value === true) {
    return <div className="Spreadsheet__data-viewer--boolean">TRUE</div>;
  }
  return value;
};

const DataViewer = ({
  getValue,

  cell,
  column,
  row,
  formulaParser,
}: Props): Node => {
  return toView(
    getComputedValue({ getValue, cell, column, row, formulaParser })
  );
};

export default DataViewer;