import React, { Component } from "react";
import { storiesOf } from "@storybook/react";
import Spreadsheet from "../dist/Spreadsheet";

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
      ...Array(100)
        .fill(10)
        .map((row, j) => [
          { value: j, readOnly: true },
          ...Array(COLUMNS.length)
            .fill(1)
            .map((cell, i) => ({ value: "" }))
        ])
    ]
  };

  handleChange = ({ row, column, value, cell }) => {
    this.setState(({ data }) => {
      const newData = [...data];
      const newRow = [...data[row]];
      newData[row] = newRow;
      newRow[column] = {
        ...cell,
        value
      };
      return {
        data: newData
      };
    });
  };

  render() {
    return <Spreadsheet data={this.state.data} onChange={this.handleChange} />;
  }
}

storiesOf("Spreadsheet", Spreadsheet).add("Spreadsheet", () => <App />);
