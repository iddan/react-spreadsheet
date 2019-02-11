// @flow

import React, { PureComponent } from "react";
import type { Node } from "react";
import * as Types from "./types";
import { moveCursorToEnd } from "./util";

type Cell = {
  value: Node
};

type Value = string | number;

export default class DataEditor extends PureComponent<
  Types.DataEditorProps<Cell, Value>,
  { cellValue: any }
> {
  input: ?HTMLInputElement;

  static defaultProps = {
    value: ""
  };
  state = { cellValue: null };

  handleChange = (e: SyntheticInputEvent<HTMLInputElement>) => {
    const { onChange, cell } = this.props;
    onChange({ ...cell, value: e.target.value });
  };

  handleInput = (input: ?HTMLInputElement) => {
    this.input = input;
  };

  componentDidMount() {
    this.setState({ cellValue: this.props.cell });

    if (this.input) {
      moveCursorToEnd(this.input);
    }
  }

  componentWillUnmount() {
    const { onCellCommit } = this.props;
    onCellCommit(this.state.cellValue, this.props.cell);
  }

  render() {
    const { getValue, column, row, cell } = this.props;
    const value = getValue({ column, row, data: cell }) || "";
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
