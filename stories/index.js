import React, { Component } from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import Spreadsheet from "../src/Spreadsheet";
import "./index.css";

const COLUMNS = Array(26)
  .fill(1)
  .map((_, i) => String.fromCharCode(65 + i));

class App extends Component {
  state = {
    data: [
      [
        { value: "", readOnly: true },
        ...COLUMNS.map(letter => ({ value: letter, readOnly: true }))
      ],
      ...Array(20)
        .fill(1)
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

  handleActiveChange = active => {
    action(`Active changed to ${active.row} ${active.column} ${active.mode}`);
  };

  render() {
    return (
      <Spreadsheet
        data={this.state.data}
        onCellChange={this.handleChange}
        onActiveChange={this.handleActiveChange}
      />
    );
  }
}

storiesOf("Spreadsheet", Spreadsheet).add("Spreadsheet", () => <App />);
