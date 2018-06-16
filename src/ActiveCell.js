// @flow
import React from "react";
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
  setData: (data: Cell) => void,
  cell: Cell,
  hidden: boolean,
  mode: Types.Mode,
  edit: () => void
|};

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
}: Props<*, *>) => {
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
          onChange={setData}
          getValue={getValue}
        />
      )}
    </div>
  );
};

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
    edit: () => ({
      mode: "edit"
    })
  }
)(ActiveCell);
