// @flow

import React, { PureComponent } from "react";
import type { Node } from "react";
import { moveCursorToEnd } from "./util";

type Cell = {
  value: Node
};

type Value = string | number;

export type Props = {
  row: number,
  column: number,
  cell: Cell,
  value: Value,
  onChange: (value: Value) => string | number
};

export default class DataEditor extends PureComponent<Props> {
  input: ?HTMLInputElement;

  static defaultProps = {
    value: ""
  };

  handleChange = (e: SyntheticInputEvent<HTMLInputElement>) => {
    this.props.onChange({ ...this.props.cell, value: e.target.value });
  };

  handleInput = (input: ?HTMLInputElement) => {
    this.input = input;
  };

  componentDidMount() {
    if (this.input) {
      moveCursorToEnd(this.input);
    }
  }

  render() {
    const { value } = this.props;
    return (
      <div className="DataEditor">
        <input
          ref={this.handleInput}
          type="text"
          onChange={this.handleChange}
          value={value}
          autoFocus
        />
      </div>
    );
  }
}
