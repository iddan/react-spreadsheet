import * as React from "react";
import Select from "react-select";
import { CellBase, DataEditorComponent, DataViewerComponent } from "..";

type Value = string | undefined;
type Cell = CellBase<Value> & {
  value: Value;
};

const OPTIONS = [
  { value: "vanilla", label: "Vanilla" },
  { value: "chocolate", label: "Chocolate" },
  { value: "caramel", label: "Caramel" },
];

export const SelectView: DataViewerComponent<Cell> = ({ cell }) => {
  const option = React.useMemo(
    () => cell && OPTIONS.find((option) => option.value === cell.value),
    [cell]
  );
  return <Select value={option} options={OPTIONS} isDisabled />;
};

export const SelectEdit: DataEditorComponent<Cell> = ({ cell, onChange }) => {
  const handleChange = React.useCallback(
    (selection) => {
      onChange({ ...cell, value: selection ? selection.value : null });
    },
    [cell, onChange]
  );
  const option = React.useMemo(
    () => cell && OPTIONS.find((option) => option.value === cell.value),
    [cell]
  );
  return (
    <Select
      value={option}
      onChange={handleChange}
      options={OPTIONS}
      autoFocus
      defaultMenuIsOpen
    />
  );
};
