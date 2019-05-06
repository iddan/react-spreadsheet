import React, { Component, Fragment } from "react";
import { createFixture } from "react-cosmos";
import Spreadsheet, {
  createEmptyMatrix
} from "../src/SpreadsheetStateProvider";
import { INITIAL_ROWS, INITIAL_COLUMNS } from "./Basic";
import "./index.css";

const initialData = createEmptyMatrix(INITIAL_ROWS, INITIAL_COLUMNS);

/**
 * Removes cells not matching the filter from matrix while maintaining the
 * minimum size that includes all of the matching cells.
 */
function filterMatrix(matrix, filter) {
  const filtered = [];
  if (matrix.length === 0) {
    return matrix;
  }
  for (let row = 0; row < matrix.length; row++) {
    if (matrix.length !== 0) {
      for (let column = 0; column < matrix[0].length; column++) {
        const cell = matrix[row][column];
        if (cell && cell.value.includes(filter)) {
          if (!filtered[0]) {
            filtered[0] = [];
          }
          if (filtered[0].length < column) {
            filtered[0].length = column + 1;
          }
          if (!filtered[row]) {
            filtered[row] = [];
          }
          filtered[row][column] = cell;
        }
      }
    }
  }
  return filtered;
}

class Filter extends Component {
  state = { data: initialData, filter: "" };

  handleChange = data => {
    this.setState({ data });
  };

  handleFilterChange = event => {
    this.setState({ filter: event.target.value });
  };

  render() {
    const { data, filter } = this.state;
    return (
      <Fragment>
        <div>
          <input
            type="text"
            placeholder="Filter"
            value={this.state.filter}
            onChange={this.handleFilterChange}
          />
        </div>
        <Spreadsheet
          data={filter ? filterMatrix(data, filter) : data}
          onChange={this.handleChange}
        />
      </Fragment>
    );
  }
}

Filter.displayName = "Spreadsheet";

export default createFixture({
  component: Filter
});
