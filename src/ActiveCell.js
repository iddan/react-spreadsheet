// @flow
import React, { Component } from "react";
import classnames from "classnames";
import { connect } from "unistore/react";
import * as Matrix from "./matrix";
import * as PointMap from "./point-map";
import * as Actions from "./actions";
import * as Types from "./types";

type Props<Cell, Value> = {|
  ...Types.Point,
  ...Types.Dimensions,
  DataEditor: Types.DataEditor<Cell, Value>,
  getValue: Types.getValue<Cell, Value>,
  onChange: (data: Cell) => void,
  setData: (data: Cell, bindings: Types.Point[]) => void,
  cell: Cell,
  hidden: boolean,
  mode: Types.Mode,
  edit: () => void,
  getBindingsForCell: Types.getBindingsForCell<Cell>,
  setCellCommit: Types.Commit => void
|};

class ActiveCell<Cell, Value> extends Component<Props<Cell, Value>> {
  state = { cellBeforeUpdate: null };
  handleChange = (cell: Cell) => {
    const { setData, getBindingsForCell } = this.props;
    const bindings = getBindingsForCell(cell);
    setData(cell, bindings);
  };

  handleCellCommit = (before: Cell | null, after: Cell | null) => {
    const { onCellCommit } = this.props;
    onCellCommit(before, after);
  };

  // NOTE: Currently all logics belongs to onCellCommit event
  componentDidUpdate(prevProps) {
    // On each ActiveCell mode transition we set previous cell value
    if (this.props.mode !== "edit" && prevProps.mode === "edit") {
      this.setState({ cellBeforeUpdate: prevProps.cell });
    }
    /* On each time we move between cells && on cell selection 
    (before it goes into "edit" mode) we set the previous cell value */
    if (
      (this.props.row !== prevProps.row ||
        this.props.column !== prevProps.column) &&
      this.props.mode === "view" &&
      this.props.cell
    ) {
      this.setState({ cellBeforeUpdate: this.props.cell });
    }
    // On each ActiveCell's mode transition we invoke handleCellCommit
    if (
      this.props.mode === "view" &&
      (prevProps.mode === "edit" || !prevProps.mode)
    ) {
      // When our needed arguments are both falsy we pass
      if (!this.state.cellBeforeUpdate && !prevProps.cell) {
        return;
        /* A falsy prevProps.cell is an exceptional case where a cell does not yet exists,
        so it must be passed as a first argument to represent the "before" state of the cell */
      } else if (!prevProps.cell) {
        this.handleCellCommit(prevProps.cell, this.state.cellBeforeUpdate);
      } else {
        this.handleCellCommit(this.state.cellBeforeUpdate, prevProps.cell);
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
            onChange={this.handleChange}
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
