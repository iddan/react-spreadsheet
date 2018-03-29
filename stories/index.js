import React, { Component, Fragment } from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import Spreadsheet from "../src/Spreadsheet";
import { range } from "../src/util";
import "./index.css";

const COLUMNS = Array.from(range(26)).map(i => String.fromCharCode(65 + i));

class App extends Component {
  state = {
    data: [
      [
        { value: "", readOnly: true },
        ...COLUMNS.map(letter => ({ value: letter, readOnly: true }))
      ],
      ...range(20)
        .map((row, j) => [
          { value: j, readOnly: true },
          ...Array(COLUMNS.length)
            .fill(1)
            .map((cell, i) => ({ value: "" }))
        ])
        .slice(1)
    ]
  };

  handleChange = ({ row, column, value }) => {
    this.setState(({ data }) => {
      const newData = [...data];
      const newRow = [...data[row]];
      newData[row] = newRow;
      newRow[column] = {
        ...data[row][column],
        value
      };
      return {
        data: newData
      };
    });
  };

  addColumn = () => {
    this.setState(({ data }) => ({
      data: data.map(row => [...row, { value: "" }])
    }));
  };

  addRow = () => {
    this.setState(({ data }) => ({
      data: [...data, Array(COLUMNS.length).fill({ value: "" })]
    }));
  };

  handleActiveChange = active => {
    action(`Active changed to ${active.row} ${active.column} ${active.mode}`);
  };

  render() {
    return (
      <Fragment>
        <button onClick={this.addColumn}>Add column</button>
        <button onClick={this.addRow}>Add row</button>
        <Spreadsheet
          data={this.state.data}
          onCellChange={this.handleChange}
          onActiveChange={this.handleActiveChange}
        />
      </Fragment>
    );
  }
}

storiesOf("Spreadsheet", Spreadsheet).add("Spreadsheet", () => <App />);
