import React, { Component, Fragment } from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import Spreadsheet from "../src/SpreadsheetStateProvider";
import { range, toColumnLetter } from "../src/util";
import "./index.css";

const COLUMNS = Array.from(range(26)).map(toColumnLetter);
const EMPTY_CELL = { value: "" };

const initialData = [
  [
    { value: "", readOnly: true },
    ...COLUMNS.map(letter => ({ value: letter, readOnly: true }))
  ],
  ...range(20)
    .map((row, j) => [
      { value: j, readOnly: true },
      ...Array(COLUMNS.length)
        .fill(1)
        .map((cell, i) => EMPTY_CELL)
    ])
    .slice(1)
];

const RangeInput = ({ cell, getValue }) => (
  <span>
    0
    <input
      type="range"
      value={getValue({ data: cell })}
      min={0}
      max={100}
      disabled
      style={{ pointerEvents: "none" }}
    />
    100
  </span>
);

initialData[4][5] = { value: 0, DataViewer: RangeInput };

class App extends Component {
  state = {
    data: initialData
  };

  handleChange = data => {
    // this.setState({ data });
  };

  addColumn = () => {
    this.setState(({ data }) => {
      const [firstRow, ...rows] = data;
      return {
        data: [
          firstRow.concat({
            value: toColumnLetter(firstRow.length - 1),
            readOnly: true
          }),
          ...rows.map(row => row.concat(EMPTY_CELL))
        ]
      };
    });
  };

  addRow = () => {
    this.setState(({ data }) => ({
      data: [
        ...data,
        [
          { value: data.length, readOnly: true },
          ...Array(COLUMNS.length).fill(EMPTY_CELL)
        ]
      ]
    }));
  };

  render() {
    return (
      <Fragment>
        <button onClick={this.addColumn}>Add column</button>
        <button onClick={this.addRow}>Add row</button>
        <Spreadsheet data={this.state.data} />
      </Fragment>
    );
  }
}

storiesOf("Spreadsheet", Spreadsheet).add("Spreadsheet", () => <App />);
