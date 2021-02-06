/**
 * Example data components for viewing and editing ranges
 */

import * as React from "react";
import { DataViewerComponent, DataEditorComponent, CellBase } from "..";

type Cell = CellBase<number | undefined>;

export const RangeView: DataViewerComponent<Cell> = ({ cell }) => (
  <input
    type="range"
    value={cell?.value}
    disabled
    style={{ pointerEvents: "none" }}
  />
);

export const RangeEdit: DataEditorComponent<Cell> = ({ cell, onChange }) => {
  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ ...cell, value: Number(event.target.value) });
    },
    [cell, onChange]
  );

  const value = cell?.value || 0;
  return <input autoFocus type="range" onChange={handleChange} value={value} />;
};
