import * as React from "react";
import { Spreadsheet, createEmptyMatrix } from "..";
import { INITIAL_ROWS, INITIAL_COLUMNS } from "./shared";
import "./index.css";

const noop = () => {};

const Viewer = ({ getValue, cell }) => {
  const value = getValue({ data: cell });
  return <input value={value} onChange={noop} placeholder="type here" />;
};

const Editor = ({ onChange, cell, getValue }) => {
  const handleChange = React.useCallback(
    (event) => {
      onChange({ ...cell, value: event.target.value });
    },
    [onChange, cell]
  );
  const value = getValue({ data: cell });
  return <input autoFocus value={value} onChange={handleChange} />;
};

const initialData = createEmptyMatrix(INITIAL_ROWS, INITIAL_COLUMNS);

initialData[0][1] = { value: "some text" };
initialData[2][2] = {
  value: "more text",
  DataEditor: Editor,
  DataViewer: Viewer,
};
initialData[5][2] = {
  value: "even more text!",
  DataEditor: Editor,
  DataViewer: Viewer,
};

initialData[3][3] = { value: 10 };

export default (
  <Spreadsheet
    data={initialData}
    onCellCommit={(...args: unknown[]) =>
      console.log("onCellCommit event", ...args)
    }
  />
);
