import * as React from "react";
import * as Types from "./types";
import { moveCursorToEnd } from "./util";

type Cell = {
  value: React.ReactNode;
};

type Value = string | number;

const DataEditor = ({
  onChange,
  cell,
  getValue,
  column,
  row,
}: Types.DataEditorProps<Cell, Value>): React.ReactNode => {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const handleChange = React.useCallback(
    (e: SyntheticInputEvent<HTMLInputElement>) => {
      onChange({ ...cell, value: e.target.value });
    },
    [onChange, cell]
  );

  React.useEffect(() => {
    if (inputRef.current) {
      moveCursorToEnd(inputRef.current);
    }
  }, [inputRef]);

  const value = getValue({ column, row, data: cell }) || "";

  return (
    <div className="Spreadsheet__data-editor">
      <input
        ref={inputRef}
        type="text"
        onChange={handleChange}
        value={value}
        autoFocus
      />
    </div>
  );
};

DataEditor.defaultProps = {
  cell: {
    value: "",
  },
};

export default DataEditor;
