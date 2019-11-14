import React, { PureComponent } from "react";
import * as Types from "./types";
import { moveCursorToEnd } from "./util";

type Cell = {
  value: Node | string;
};

type Value = string | number;

export default class DataEditor extends PureComponent<
  Types.DataEditorProps<Cell, Value>
> {
  input: HTMLInputElement | null | undefined;

  static defaultProps = {
    value: ""
  };

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { onChange, cell } = this.props;
    onChange({ ...cell, value: e.target.value });
  };

  handleInput = (input: HTMLInputElement | null | undefined) => {
    this.input = input;
  };

  componentDidMount() {
    if (this.input) {
      moveCursorToEnd(this.input);
    }
  }

  render() {
    const { getValue, column, row, cell } = this.props;
    const value = getValue({ column, row, data: cell }) || "";
    return (
      <div className='DataEditor'>
        <input
          ref={this.handleInput}
          type='text'
          onChange={this.handleChange}
          value={value}
          autoFocus
        />
      </div>
    );
  }
}
