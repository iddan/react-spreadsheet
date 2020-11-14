import React, { useRef, useCallback, ReactNode, useEffect } from "react";
import * as Types from "./types";
import { moveCursorToEnd } from "./util";

type Cell = {
  value: ReactNode;
};

type Value = string | number;

const DataEditor = ({
  onChange,
  cell,
  getValue,
  column,
  row,
}: Types.DataEditorProps<Cell, Value>): ReactNode => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = useCallback(
    (e: SyntheticInputEvent<HTMLInputElement>) => {
      onChange({ ...cell, value: e.target.value });
    },
    [onChange, cell]
  );

  useEffect(() => {
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
