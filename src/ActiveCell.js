import React from "react";
import classnames from "classnames";
import { connect } from "unistore/react";
import * as Matrix from "./matrix";
import * as Actions from "./actions";

const ActiveCell = ({
  DataEditor,
  getValue,
  onChange,
  row,
  column,
  cell,
  width,
  height,
  top,
  left,
  setData,
  hidden,
  mode,
  edit
}) =>
  hidden ? null : (
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
          onChange={setData}
          getValue={getValue}
        />
      )}
    </div>
  );

const mapStateToProps = state =>
  state.active && state.tableDimensions && state.activeDimensions
    ? {
        hidden: false,
        ...state.active,
        cell: Matrix.get(state.active.row, state.active.column, state.data),
        width: state.activeDimensions.width,
        height: state.activeDimensions.height,
        top: state.activeDimensions.top - state.tableDimensions.top,
        left: state.activeDimensions.left - state.tableDimensions.left,
        mode: state.mode
      }
    : { hidden: true };

export default connect(mapStateToProps, {
  setData: Actions.setData,
  edit: () => ({
    mode: "edit"
  })
})(ActiveCell);
