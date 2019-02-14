import React from "react";

import Spreadsheet from "../src/SpreadsheetStateProvider";
import { range } from "../src/util";
import "./index.css";
import { action } from "@storybook/addon-actions";

export const INITIAL_ROWS = 6;
export const INITIAL_COLUMNS = 4;

const Viewer = ({ getValue, cell }) => {
  const value = getValue({ data: cell });
  return <input value={value} placeholder="type here" />;
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

const CellCommit = props => (
  <Spreadsheet data={initialData} onCellCommit={action("onCellCommit event")} />
);

export default CellCommit;
