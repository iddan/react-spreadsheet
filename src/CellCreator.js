// @flow

import React, { PureComponent } from "react";
import type { ComponentType } from "react";

type Props<Cell, Value> = {
  width: number,
  height: number,
  top: number,
  left: number,
  value: Value,
  row: number,
  column: number,
  cell: Cell,
  onChange: ({ value: Value, row: number, column: number, cell: Cell }) => void,
  DataEditor: ComponentType<{
    row: number,
    column: number,
    cell: Cell,
    onChange: (value: Value) => void
  }>
};

type State<Value> = {
  value: Value
};

export default class CellCreator<Cell, Value> extends PureComponent<
  Props<Cell, Value>,
  State<Value>
> {
  state = { value: this.props.value };

  emitChange = () => {
    const { row, column, cell } = this.props;
    requestIdleCallback(() => {
      this.props.onChange({
        row,
        column,
        cell,
        value: this.state.value
      });
    });
  };

  handleChange = (value: Value) => {
    this.setState({ value }, this.emitChange);
  };

  componentWillMount() {
    this.emitChange();
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.value !== this.state.value) {
      this.setState({ value: nextProps.value });
    }
  }

  render() {
    const { DataEditor, width, height, top, left } = this.props;
    return (
      <div className="CellCreator" style={{ width, height, top, left }}>
        <DataEditor onChange={this.handleChange} value={this.state.value} />
      </div>
    );
  }
}
