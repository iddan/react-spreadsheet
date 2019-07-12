import React, { Component } from "react";
import { createFixture } from "react-cosmos";
import Spreadsheet, {
  createEmptyMatrix
} from "../src/SpreadsheetStateProvider";
import { INITIAL_ROWS, INITIAL_COLUMNS } from "./Basic";
import "./index.css";

const initialData = createEmptyMatrix(INITIAL_ROWS, INITIAL_COLUMNS);

class AsyncCell extends Component {
  state = { loading: false };

  handleClick = () => {
    this.setState({ loading: true });
    const { onChange, row, column } = this.props;
    setTimeout(() => {
      this.setState({ loading: false });
      onChange({ row, column, value: Math.floor(Math.random() * 100) });
    }, 1000);
  };

  render() {
    const { cell, getValue } = this.props;
    const value = getValue({ data: cell });
    return (
      <div>
        {value}
        {this.state.loading ? (
          "Loading..."
        ) : (
          <button onClick={this.handleClick}>Click Me</button>
        )}
      </div>
    );
  }
}

initialData[2][2] = {
  value: 1,
  DataViewer: AsyncCell,
  DataEditor: AsyncCell
};

export default createFixture({
  component: Spreadsheet,
  props: {
    data: initialData,
    onCellCommit: (...args) => console.log("onCellCommit", ...args),
    onChange: (...args) => console.log("onChange", ...args)
  }
});
