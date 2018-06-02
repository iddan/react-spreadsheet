// @flow
import React, { PureComponent } from "react";
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
  getBindingsForCell: Types.getBindingsForCell<Cell>,
  changeCell: (data: Cell, bindings: Types.Point[]) => void,
  cell: Cell,
  hidden: boolean,
  mode: Types.Mode,
  edit: () => void
|};

class ActiveCell extends PureComponent<Props<*, *>> {
  handleChange = data => {
    const { row, column, cell, getBindingsForCell, changeCell } = this.props;
    const bindings = getBindingsForCell({ row, column, data: cell });
    changeCell(data, bindings);
  };

  render() {
    const {
      DataEditor,
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

const mapStateToProps = (state: Types.StoreState<*>) => {
  if (!state.active || !PointMap.has(state.active, state.cellDimensions)) {
    return { hidden: true };
  }
  const dimensions = PointMap.get(state.active, state.cellDimensions);
  return {
    hidden: false,
    ...state.active,
    cell: Matrix.get(state.active.row, state.active.column, state.data),
    width: dimensions.width,
    height: dimensions.height,
    top: dimensions.top,
    left: dimensions.left,
    mode: state.mode
  };
};

export default connect(mapStateToProps, {
  changeCell: Actions.changeCell,
  edit: Actions.edit
})(ActiveCell);
