import React, { Component } from "react";
import { createFixture } from "react-cosmos";
import Spreadsheet, {
  createEmptyMatrix
} from "../src/SpreadsheetStateProvider";
import { INITIAL_ROWS, INITIAL_COLUMNS } from "./Basic";
import "./index.css";

const initialData = createEmptyMatrix(INITIAL_ROWS, INITIAL_COLUMNS);

const RangeView = ({ cell, getValue }) => (
  <input
    type="range"
    value={getValue({ data: cell })}
    disabled
    style={{ pointerEvents: "none" }}
  />
);

class RangeEdit extends Component {
  handleChange = (e: SyntheticInputEvent<HTMLInputElement>) => {
    const { onChange, cell } = this.props;
    onChange({ ...cell, value: e.target.value });
  };

  render() {
    const { getValue, column, row, cell } = this.props;
    const value = getValue({ column, row, data: cell }) || 0;
    return (
      <input
        autoFocus
        type="range"
        onChange={this.handleChange}
        value={value}
      />
    );
  }
}

initialData[2][2] = { value: 0, DataViewer: RangeView, DataEditor: RangeEdit };

Spreadsheet.displayName = "Spreadsheet";

export default createFixture({
  component: Spreadsheet,
  name: "CustomCell",
  props: {
    data: initialData
  }
});
