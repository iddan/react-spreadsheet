import React, { Component } from "react";

import Spreadsheet from "../src/SpreadsheetStateProvider";
import { range } from "../src/util";
import { INITIAL_ROWS, INITIAL_COLUMNS } from "./Basic";
import Select from "react-select";
import "./index.css";

const initialData = range(INITIAL_ROWS).map(() => Array(INITIAL_COLUMNS));

const OPTIONS = ["Vanilla", "Chocolate", "Caramel"];

const SelectView = ({ cell, getValue }) => (
  <Select value={getValue({ data: cell })} options={OPTIONS} disabled />
);

class SelectEdit extends Component {
  handleChange = selection => {
    const { onChange, cell } = this.props;
    onChange({ ...cell, value: selection.value });
  };

  render() {
    const { getValue, column, row, cell } = this.props;
    const value = getValue({ column, row, data: cell }) || 0;
    return <Select value={value} onChange={this.handleChange} />;
  }
}

initialData[2][2] = {
  value: 0,
  DataViewer: SelectView,
  DataEditor: SelectEdit
};

const CustomCell = () => <Spreadsheet data={initialData} />;

export default CustomCell;
