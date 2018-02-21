// @flow

import React, { PureComponent } from "react";
import type { ComponentType, Node } from "react";
import * as Types from "./types";

type Cell = {
  component?: ComponentType<{
    row: number,
    column: number,
    value: Node
  }>
};

type Props = {
  ...Types.CellComponentProps<Cell, Node>,
  cell: Cell,
  getValue: Types.getValue<Cell, Node>
};

export default class DataViewer extends PureComponent<Props> {
  render() {
    const { getValue, cell, column, row } = this.props;
    const value = getValue({ cell, column, row });
    if (cell && cell.component) {
      return <cell.component {...this.props} value={value} />;
    }
    return value;
  }
}
