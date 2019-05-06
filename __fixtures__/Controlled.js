import React, { Component, Fragment } from "react";

import { createFixture } from "react-cosmos";
import Spreadsheet, {
  createEmptyMatrix
} from "../src/SpreadsheetStateProvider";
import { range } from "../src/util";
import * as Matrix from "../src/matrix";
import { INITIAL_ROWS, INITIAL_COLUMNS } from "./Basic";
import "./index.css";

const initialData = createEmptyMatrix(INITIAL_ROWS, INITIAL_COLUMNS);

class Controlled extends Component {
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
        <div>
          <button onClick={this.addColumn}>Add column</button>
          <button onClick={this.addRow}>Add row</button>
        </div>
        <Spreadsheet data={this.state.data} onChange={this.handleChange} />
      </Fragment>
    );
  }
}

Controlled.displayName = "Spreadsheet";

export default createFixture({
  component: Controlled,
  name: "Controlled",
  props: {
    data: initialData
  }
});
