import React, { Component, Fragment } from "react";

import Spreadsheet from "../src/SpreadsheetStateProvider";
import * as Matrix from "../src/matrix";
import { range } from "../src/util";
import { INITIAL_ROWS, INITIAL_COLUMNS } from "./Basic";
import "./index.css";

const initialData = range(INITIAL_ROWS).map(() => Array(INITIAL_COLUMNS));

export default class Controlled extends Component {
  state = {
    data: initialData
  };

  handleChange = data => {
    this.setState({ data });
  };

  addColumn = () => {
    this.setState(({ data }) => {
      return {
        data: data.map(row => {
          const nextRow = [...row];
          nextRow.length += 1;
          return nextRow;
        })
      };
    });
  };

  addRow = () => {
    this.setState(({ data }) => {
      const { columns } = Matrix.getSize(data);
      return { data: [...data, Array(columns)] };
    });
  };

  render() {
    return (
      <Fragment>
        <button onClick={this.addColumn}>Add column</button>
        <button onClick={this.addRow}>Add row</button>
        <Spreadsheet data={this.state.data} onChange={this.handleChange} />
      </Fragment>
    );
  }
}
