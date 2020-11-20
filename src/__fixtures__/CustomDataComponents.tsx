/**
 * This fixture demonstrates
 */

import React, { useCallback } from "react";
import { Spreadsheet, createEmptyMatrix } from "..";
import { INITIAL_ROWS, INITIAL_COLUMNS } from "./shared";
import "./index.css";

const initialData = createEmptyMatrix(INITIAL_ROWS, INITIAL_COLUMNS);

const RangeView = ({ cell, getValue }) => (
  <input
    type="range"
    value={getValue({ data: cell })}
    disabled
    style={{ pointerEvents: "none" }}
  />
);

const RangeEdit = ({ getValue, column, row, cell, onChange }) => {
  const handleChange = useCallback(
    (event: SyntheticInputEvent<HTMLInputElement>) => {
      onChange({ ...cell, value: event.target.value });
    },
    [cell, onChange]
  );

  const value = getValue({ column, row, data: cell }) || 0;
  return <input autoFocus type="range" onChange={handleChange} value={value} />;
};

initialData[2][2] = { value: 0, DataViewer: RangeView, DataEditor: RangeEdit };

export default <Spreadsheet data={initialData} />;
