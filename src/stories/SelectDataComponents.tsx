import React, { useCallback } from "react";
import Select from "react-select";
import "react-select/dist/react-select.css";

const OPTIONS = [
  { value: "vanilla", label: "Vanilla" },
  { value: "chocolate", label: "Chocolate" },
  { value: "caramel", label: "Caramel" },
];
const SELECT_WIDTH = 200;

export const SelectView = ({ cell, getValue }) => (
  <Select
    value={getValue({ data: cell })}
    options={OPTIONS}
    disabled
    style={{ width: 200 }}
  />
);

export const SelectEdit = ({ cell, onChange, getValue, column, row }) => {
  const handleChange = useCallback(
    (selection) => {
      onChange({ ...cell, value: selection ? selection.value : null });
    },
    [cell, onChange]
  );
  const value = getValue({ column, row, data: cell }) || 0;
  return (
    <Select
      value={value}
      onChange={handleChange}
      options={OPTIONS}
      style={{ width: SELECT_WIDTH }}
    />
  );
};
