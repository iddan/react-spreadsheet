/**
 * Example data components for viewing and editing ranges
 */

import * as React from "react";

export const RangeView = ({ cell, getValue }) => (
  <input
    type="range"
    value={getValue({ data: cell })}
    disabled
    style={{ pointerEvents: "none" }}
  />
);

export const RangeEdit = ({ getValue, column, row, cell, onChange }) => {
  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ ...cell, value: event.target.value });
    },
    [cell, onChange]
  );

  const value = getValue({ column, row, data: cell }) || 0;
  return <input autoFocus type="range" onChange={handleChange} value={value} />;
};
