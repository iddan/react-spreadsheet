import React, { useCallback } from "react";
import Select from "react-select";
import { Spreadsheet, createEmptyMatrix } from "..";
import { INITIAL_ROWS, INITIAL_COLUMNS } from "./shared";
import "react-select/dist/react-select.css";
import "./index.css";

const initialData = createEmptyMatrix(INITIAL_ROWS, INITIAL_COLUMNS);

const OPTIONS = [
  { value: "vanilla", label: "Vanilla" },
  { value: "chocolate", label: "Chocolate" },
  { value: "caramel", label: "Caramel" },
];
const SELECT_WIDTH = 200;

const SelectView = ({ cell, getValue }) => (
  <Select
    value={getValue({ data: cell })}
    options={OPTIONS}
    disabled
    style={{ width: 200 }}
  />
);

const SelectEdit = ({ cell, onChange, getValue, column, row }) => {
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

initialData[2][2] = {
  value: 0,
  DataViewer: SelectView,
  DataEditor: SelectEdit,
};

export default <Spreadsheet data={initialData} />;
