import {Component, ReactChildren} from "react";
import { Parser as FormulaParser } from "hot-formula-parser";
import * as Types from "./types";

type Cell = {
  component?: Component<{
    row: number,
    column: number,
    value: ReactChildren
  }>
};

type Props = Types.ICellComponentProps<Cell, Node> & {
  formulaParser: FormulaParser
};

const toView = (value: Node | boolean): ReactChildren => {
  if (value === false) {
    return <div className="boolean">FALSE</div>;
  }
  if (value === true) {
    return <div className="boolean">TRUE</div>;
  }

  return value;
};

const DataViewer = ({ getValue, cell, column, row, formulaParser }: Props) => {
  const rawValue: string | Node = getValue({ data: cell, column, row });
  if (typeof rawValue === "string" && rawValue.startsWith("=")) {
    const { result, error } = formulaParser.parse(rawValue.slice(1));
    return error || toView(result);
  }
  return toView(rawValue);
};

export default DataViewer;
