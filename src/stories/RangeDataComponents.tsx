/**
 * Example data components for viewing and editing ranges
 */

import * as React from "react";
import { DataViewerComponent, CellBase } from "..";
import { DataEditorComponent } from "../types";

type Value = string;

export const RangeView: DataViewerComponent<CellBase<Value>, Value> = ({
  cell,
  column,
  row,
  getValue,
}) => (
  <input
    type="range"
    value={getValue({ data: cell, column, row })}
    disabled
    style={{ pointerEvents: "none" }}
  />
);

export const RangeEdit: DataEditorComponent<
  CellBase<Value> & { value: Value },
  string
> = ({ getValue, column, row, cell, onChange }) => {
  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ ...cell, value: event.target.value });
    },
    [cell, onChange]
  );

  const value = getValue({ column, row, data: cell }) || 0;
  return <input autoFocus type="range" onChange={handleChange} value={value} />;
};
