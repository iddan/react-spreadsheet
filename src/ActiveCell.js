// @flow
import React, { Component } from "react";
import classnames from "classnames";
import { connect } from "unistore/react";
import * as Matrix from "./matrix";
import * as PointMap from "./point-map";
import * as Actions from "./actions";
import * as Types from "./types";

type State<Cell> = {
  cellBeforeUpdate: Cell
};

type Props<Cell, Value> = {|
  ...Types.Point,
  ...Types.Dimensions,
  DataEditor: Types.DataEditor<Cell, Value>,
  getValue: Types.getValue<Cell, Value>,
  onChange: (data: Cell) => void,
  setData: (active: Types.Point, data: Cell, bindings: Types.Point[]) => void,
  cell: Cell,
  hidden: boolean,
  mode: Types.Mode,
  edit: () => void,
  getBindingsForCell: Types.getBindingsForCell<Cell>,
  onCellCommit: Types.onCellCommit<Cell>
|};

class ActiveCell<Cell, Value> extends Component<Props<Cell, Value>, State<*>> {
  state = { cellBeforeUpdate: null };

  handleChange = (row: number, column: number, cell: Cell) => {
    const { setData, getBindingsForCell } = this.props;
    const bindings = getBindingsForCell(cell);

    setData({ row, column }, cell, bindings);
  };

  // NOTE: Currently all logics here belongs to onCellCommit event
  componentDidUpdate(prevProps) {
    const { cell, mode, onCellCommit } = this.props;

    if (cell || cell === undefined) {
      if (prevProps.mode === "view" && mode === "edit") {
        this.setState({ cellBeforeUpdate: prevProps.cell });
      } else if (
        prevProps.mode === "edit" &&
        prevProps.mode !== this.props.mode &&
        prevProps.cell &&
        prevProps.cell !== this.state.cellBeforeUpdate
      ) {
        onCellCommit(this.state.cellBeforeUpdate, prevProps.cell);
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
            onChange={(...args) => this.handleChange(row, column, ...args)}
            getValue={getValue}
          />
        )}
      </div>
    );
  }
}

const EmptyDimensions = {
  width: 0,
  height: 0,
  top: 0,
  left: 0
};

const mapStateToProps = (state: Types.StoreState<*>) => {
  if (!state.active || !PointMap.has(state.active, state.cellDimensions)) {
    return { hidden: true };
  }
  const dimensions =
    PointMap.get(state.active, state.cellDimensions) || EmptyDimensions;
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
    edit: Actions.edit
  }
)(ActiveCell);
