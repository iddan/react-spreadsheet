import React, { Component } from "react";
import classnames from "classnames";
import { connect } from "unistore/react";
import * as Matrix from "./matrix";
import * as Actions from "./actions";
import * as Types from "./types";
import { getCellDimensions } from "./util";

type State<Cell> = {
  cellBeforeUpdate: Cell
};

type Props<Cell, Value> = {
  DataEditor: Types.DataEditor<Cell, Value>,
  getValue: Types.getValue<Cell, Value>,
  onChange: (data: Cell) => void,
  setData: (active: Types.IPoint, data: Cell, bindings: Types.IPoint[]) => void,
  cell: Cell,
  hidden: boolean,
  mode: Types.Mode,
  edit: () => void,
  commit: Types.commit<Cell>,
  getBindingsForCell: Types.getBindingsForCell<Cell>
} & Types.IPoint & Types.IDimensions;

class ActiveCell<Cell, Value> extends Component<Props<Cell, Value>, State<any>> {
  state = { cellBeforeUpdate: null };

  handleChange = (row: number, column: number, cell: Cell) => {
    const { setData, getBindingsForCell } = this.props;
    const bindings = getBindingsForCell(cell);

    setData({ row, column }, cell, bindings);
  };

  // NOTE: Currently all logics here belongs to commit event
  componentDidUpdate(prevProps: Props<Cell, Value>) {
    const { cell, mode, commit } = this.props;

    if (cell || cell === undefined) {
      if (prevProps.mode === "view" && mode === "edit") {
        this.setState({ cellBeforeUpdate: prevProps.cell });
      } else if (
        prevProps.mode === "edit" &&
        prevProps.mode !== this.props.mode &&
        prevProps.cell &&
        prevProps.cell !== this.state.cellBeforeUpdate
      ) {
        commit([
          { prevCell: this.state.cellBeforeUpdate, nextCell: prevProps.cell }
        ]);
      }
    }
  }

  render() {
    let { DataEditor } = this.props;
    const {
      getValue,
      row,
      column,
      cell,
      width,
      height,
      top,
      left,
      hidden,
      mode,
      edit
    } = this.props;
    DataEditor = (cell && cell.DataEditor) || DataEditor;
    return hidden ? null : (
      <div
        className={classnames("ActiveCell", mode)}
        style={{ width, height, top, left }}
        onClick={mode === "view" ? edit : undefined}
      >
        {mode === "edit" && (
          <DataEditor
            row={row}
            column={column}
            cell={cell}
            onChange={(cell: Cell) => this.handleChange(row, column, cell)}
            getValue={getValue}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state: Types.IStoreState<any>) => {
  const dimensions = state.active && getCellDimensions(state.active, state);
  if (!state.active || !dimensions) {
    return { hidden: true };
  }
  return {
    hidden: false,
    ...state.active,
    // $FlowFixMe
    cell: Matrix.get(state.active.row, state.active.column, state.data),
    width: dimensions.width,
    height: dimensions.height,
    top: dimensions.top,
    left: dimensions.left,
    mode: state.mode
  };
};

export default connect(
  mapStateToProps,
  {
    setData: Actions.setData,
    edit: Actions.edit,
    commit: Actions.commit
  }
)(ActiveCell);
