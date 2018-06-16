// @flow

import React from "react";
import type { ComponentType, Node } from "react";
import type { Parser as FormulaParser } from "hot-formula-parser";
import * as Types from "./types";

type Cell = {
  component?: ComponentType<{
    row: number,
    column: number,
    value: Node
  }>
};

type Props = Types.CellComponentProps<Cell, Node> & {
  formulaParser: FormulaParser
};

const toView = (value: string | number | boolean): Node => {
  if (value === false) {
    return <div className="boolean">FALSE</div>;
  }
  if (value === true) {
    return <div className="boolean">TRUE</div>;
  }
  return value;
};

const DataViewer = ({ getValue, cell, column, row, formulaParser }: Props) => {
  const rawValue = getValue({ data: cell, column, row });
  if (typeof rawValue === "string" && rawValue.startsWith("=")) {
    const { result, error } = formulaParser.parse(rawValue.slice(1));
    return error || toView(result);
  }
  return toView(rawValue);
};

export default DataViewer;
