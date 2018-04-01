import React, { Component, Fragment } from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import Spreadsheet from "../src/Spreadsheet";
import { range, toColumnLetter } from "../src/util";
import "./index.css";

const COLUMNS = Array.from(range(26)).map(toColumnLetter);

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

  handleChange = data => {
    // this.setState({ data });
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

  render() {
    return (
      <Fragment>
        <button onClick={this.addColumn}>Add column</button>
        <button onClick={this.addRow}>Add row</button>
        <Spreadsheet
          data={this.state.data}
          onChange={this.handleChange}
          onActivate={action("onActivate")}
          onModeChange={action("onModeChange")}
          onSelect={action("onSelect")}
        />
      </Fragment>
    );
  }
}

storiesOf("Spreadsheet", Spreadsheet).add("Spreadsheet", () => <App />);
