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
  setActiveLocalCell: (data: Cell, bindings: Types.Point[]) => void,
  cell: Cell,
  hidden: boolean,
  mode: Types.Mode,
  edit: () => void,
  getBindingsForCell: Types.getBindingsForCell<Cell>
|};

class ActiveCell<Cell, Value> extends Component<Props<Cell, Value>> {
  /** @todo update API */

  handleChange = cell => {
    const { setActiveLocalCell, getBindingsForCell } = this.props;
    const bindings = getBindingsForCell(cell);
    setActiveLocalCell(cell, bindings);
  };

  render() {
    let { DataEditor } = this.props;
    const {
      getValue,
      row,
      column,
      width,
      height,
      top,
      left,
      cell,
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
  const { mode, activeLocalCell } = state;
  if (!state.active || !PointMap.has(state.active, state.cellDimensions)) {
    return { mode, hidden: true };
  }
  const dimensions =
    PointMap.get(state.active, state.cellDimensions) || EmptyDimensions;
  const cell = Matrix.get(state.active.row, state.active.column, state.data);
  return {
    mode,
    hidden: false,
    ...state.active, // $FlowFixMe
    cell: activeLocalCell || cell,
    width: dimensions.width,
    height: dimensions.height,
    top: dimensions.top,
    left: dimensions.left
  };
};

export default connect(
  mapStateToProps,
  {
    setActiveLocalCell: Actions.setActiveLocalCell,
    edit: Actions.edit
  }
)(ActiveCell);
