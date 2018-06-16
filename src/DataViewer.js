// @flow

import React, { PureComponent } from "react";
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

export default class DataViewer extends PureComponent<Props> {
  render() {
    const { getValue, cell, column, row, formulaParser } = this.props;
    const rawValue = getValue({ data: cell, column, row });
    if (typeof rawValue === "string" && rawValue.startsWith("=")) {
      const { result, error } = formulaParser.parse(rawValue.slice(1));
      return error || result;
    }
    return rawValue;
  }
}
