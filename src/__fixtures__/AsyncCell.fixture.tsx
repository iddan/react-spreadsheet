import * as React from "react";
import { Spreadsheet, createEmptyMatrix } from "..";
import { INITIAL_ROWS, INITIAL_COLUMNS } from "./shared";
import "./index.css";

const initialData = createEmptyMatrix(INITIAL_ROWS, INITIAL_COLUMNS);

const AsyncCell = ({ onChange, row, column, cell, getValue }) => {
  const [loading, setLoading] = React.useState(false);
  const handleClick = React.useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const nextValue = Math.floor(Math.random() * 100);
      onChange({ row, column, value: nextValue });
    }, 1000);
  }, [setLoading, onChange, row, column]);
  const value = getValue({ data: cell });
  return (
    <div>
      {value}
      {loading ? "Loading..." : <button onClick={handleClick}>Click Me</button>}
    </div>
  );
};

initialData[2][2] = {
  value: 1,
  DataViewer: AsyncCell,
  DataEditor: AsyncCell,
};

export default (
  <Spreadsheet
    data={initialData}
    onCellCommit={(...args: unknown[]) => console.log("onCellCommit", ...args)}
    onChange={(...args: unknown[]) => console.log("onChange", ...args)}
  />
);
