import React, { Component } from "react";
import Spreadsheet from "../src/SpreadsheetStateProvider";
import { action } from "@storybook/addon-actions";
import { range } from "../src/util";
import { INITIAL_ROWS, INITIAL_COLUMNS } from "./Basic";
import "./index.css";

const initialData = range(INITIAL_ROWS).map(() => Array(INITIAL_COLUMNS));

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

const AsyncData = () => (
  <Spreadsheet
    data={initialData}
    onCellCommit={action("onCellCommit")}
    onChange={action("onChange")}
  />
);

export default AsyncData;
