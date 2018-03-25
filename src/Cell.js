// @flow

import React, { Component } from "react";
import classnames from "classnames";
import shallowEqual from "fbjs/lib/shallowEqual";
import * as Types from "./types";
import Store, {
  CELL_VALUE_CHANGE,
  CELL_MODE_CHANGE,
  CELL_SELECT
} from "./Store";

export type Props<CellType, Value> = {
  row: number,
  column: number,
  DataEditor: Types.DataEditor<CellType, Value>,
  DataViewer: Types.DataViewer<CellType, Value>,
  getValue: Types.getValue<CellType, Value>
};

type State<Value> = {
  value: Value,
  isSelected: boolean,
  mode: Types.Mode
};

const getInitialValue = ({ store, row, column, emptyValue }: Props) => {
  const { initialData } = store;
  if (
    initialData &&
    initialData[row] &&
    initialData[row][column] !== undefined
  ) {
    return emptyValue;
  }
  return emptyValue;
};

class Cell<CellType, Value> extends Component<
  Props<CellType, Value> & { store: Store },
  State<Value>
> {
  state = {
    value: getInitialValue(this.props),
    isSelected: false,
    mode: "view"
  };

  /* external cells handlers */

  handleCellSelect = cell => {
    const { column, row } = this.props;
    const nextIsSelect = cell.column === column && cell.row === row;
    if (!nextIsSelect) {
      this.setState({ isSelected: false, mode: "view" });
    }
  };

  handleCellValueChange = cell => {
    const { column, row } = this.props;
    if (column === cell.column && cell.row === row) {
      this.setState({ value: cell.value });
    }
  };

  handleCellModeChange = cell => {
    const { column, row } = this.props;
    if (column === cell.column && cell.row === row) {
      this.setState({ mode: cell.mode });
    }
  };

  componentDidMount() {
    const { store } = this.props;
    store.on(CELL_VALUE_CHANGE, this.handleCellValueChange);
    store.on(CELL_MODE_CHANGE, this.handleCellModeChange);
    store.on(CELL_SELECT, this.handleCellSelect);
  }

  componentWillUnmount() {
    const { store } = this.props;
    store.off(CELL_VALUE_CHANGE, this.handleCellValueChange);
    store.off(CELL_MODE_CHANGE, this.handleCellModeChange);
    store.off(CELL_SELECT, this.handleCellSelect);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqual(nextState, this.state);
  }

  componentDidUpdate() {
    if (this.root && this.state.isSelected && this.state.mode === "view") {
      this.root.focus();
    }
  }

  select = () => {
    const { store, row, column } = this.props;
    store.emit(CELL_SELECT, { row, column });
    store.on(CELL_SELECT, this.handleCellSelect);
  };

  handleClick = () => {
    this.setState({ isSelected: true });
    this.select();
  };

  handleDoubleClick = () => {
    const { store, row, column } = this.props;
    this.setState({ isSelected: true, mode: "edit" });
    this.select();
    store.emit(CELL_MODE_CHANGE, { row, column, mode: "edit" });
  };

  handleValueChange = value => {
    const { store, row, column } = this.props;
    this.setState({ value });
    store.emit(CELL_VALUE_CHANGE, { row, column, value });
  };

  handleRoot = root => {
    this.root = root;
  };

  render() {
    const { row, column, DataViewer, DataEditor, getValue } = this.props;
    const { isSelected, value, mode } = this.state;
    return (
      <td
        ref={this.handleRoot}
        className={classnames(mode, {
          active: isSelected,
          readonly: value && value.readOnly
        })}
        onClick={this.handleClick}
        tabIndex={0}
      >
        {mode === "edit" ? (
          <DataEditor
            column={column}
            row={row}
            cell={value}
            value={getValue({ row, column, cell: value })}
            onChange={this.handleChange}
          />
        ) : (
          <DataViewer
            column={column}
            row={row}
            cell={value}
            getValue={getValue}
          />
        )}
      </td>
    );
  }
}

const ConnectedCell = props => (
  <Store.Consumer>{store => <Cell {...props} store={store} />}</Store.Consumer>
);

export default ConnectedCell;
