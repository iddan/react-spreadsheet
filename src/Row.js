// @flow

import React, { PureComponent } from "react";
import type { ComponentType } from "react";
import type { Props as CellProps } from "./Cell";
import * as Types from "./types";

export type Props<CellType, Value> = {
  index: number,
  columns: number,
  DataViewer: Types.DataViewer<CellType, Value>,
  Cell: ComponentType<CellProps<CellType, Value>>,
  DataEditor: Types.DataEditor<CellType, Value>,
  getValue: Types.getValue<CellType, Value>,
  onChange: Types.onChange<Value>
};

export default class Row<CellType, Value> extends PureComponent<
  Props<CellType, Value>
> {
  render() {
    const {
      index,
      columns,
      DataViewer,
      Cell,
      DataEditor,
      getValue,
      onChange
    } = this.props;
    return (
      <tr>
        {Array(columns)
          .fill(1)
          .map((_, column) => {
            return (
              <Cell
                {...{ DataViewer, DataEditor, getValue, onChange }}
                key={column}
                row={index}
                column={column}
              />
            );
          })}
      </tr>
    );
  }
}
