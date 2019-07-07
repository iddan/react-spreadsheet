import React from "react";
import { createFixture } from "react-cosmos";
import Spreadsheet, {
  createEmptyMatrix
} from "../src/SpreadsheetStateProvider";
import { INITIAL_ROWS, INITIAL_COLUMNS } from "./Basic";
import "./index.css";

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

const initialData = createEmptyMatrix(INITIAL_ROWS, INITIAL_COLUMNS);

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
    onCellCommit: (...args) => console.log("onCellCommit event", ...args)
  }
});
