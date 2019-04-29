import React from "react";
import { createFixture } from "react-cosmos";
import Spreadsheet from "../src/SpreadsheetStateProvider";
import { range } from "../src/util";
import "./index.css";

export const INITIAL_ROWS = 6;
export const INITIAL_COLUMNS = 4;

const noop = () => {};

const Viewer = ({ getValue, cell }) => {
  const value = getValue({ data: cell });
  return <input value={value} onChange={noop} placeholder="type here" />;
};

class Editor extends React.Component {
  handleOnChange = event => {
    const { onChange, cell } = this.props;
    onChange({ ...cell, value: event.target.value });
  };
  render() {
    const { getValue, cell } = this.props;
    const value = getValue({ data: cell });
    return <input autoFocus value={value} onChange={this.handleOnChange} />;
  }
}

const initialData = range(INITIAL_ROWS).map(() => Array(INITIAL_COLUMNS));
initialData[0][1] = { value: "some text" };
initialData[2][2] = {
  value: "more text",
  DataEditor: Editor,
  DataViewer: Viewer
};
initialData[5][2] = {
  value: "even more text!",
  DataEditor: Editor,
  DataViewer: Viewer
};

initialData[3][3] = { value: 10 };

Spreadsheet.displayName = "Spreadsheet";

export default createFixture({
  component: Spreadsheet,
  name: "onCellCommit",
  props: {
    data: initialData,
    onCellCommit: event => console.log("onCellCommit event", event)
  }
});
