// @flow
import React, { useEffect, useRef, useCallback } from "react";
import classnames from "classnames";
import { connect } from "unistore/react";
import * as Matrix from "./matrix";
import * as Actions from "./actions";
import * as Types from "./types";
import { getCellDimensions } from "./util";

type Props<Cell, Value> = {|
  ...Types.Point,
  ...Types.Dimensions,
  DataEditor: Types.DataEditor<Cell, Value>,
  getValue: Types.getValue<Cell, Value>,
  onChange: (data: Cell) => void,
  setCellData: (
    active: Types.Point,
    data: Cell,
    bindings: Types.Point[]
  ) => void,
  cell: Cell,
  hidden: boolean,
  mode: Types.Mode,
  edit: () => void,
  commit: Types.commit<Cell>,
  getBindingsForCell: Types.getBindingsForCell<Cell>,
|};

function ActiveCell<Cell: Types.CellBase, Value>(props: Props<Cell, Value>) {
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
    edit,
    setCellData,
    getBindingsForCell,
    commit,
  } = props;
  const initialCellRef = useRef<Cell | null>(null);
  const prevPropsRef = useRef<Props<Cell, Value> | null>(null);

  const handleChange = useCallback(
    (cell: Cell) => {
      const bindings = getBindingsForCell(cell);
      setCellData({ row, column }, cell, bindings);
    },
    [getBindingsForCell, setCellData, row, column]
  );

  useEffect(() => {
    const prevProps = prevPropsRef.current;
    prevPropsRef.current = props;

    if (!prevProps) {
      return;
    }

    // Commit
    const coordsChanged = row !== prevProps.row || column !== prevProps.column;
    const exitedEditMode = mode !== "edit";

    if (coordsChanged || exitedEditMode) {
      const initialCell = initialCellRef.current;
      if (prevProps.cell !== initialCell) {
        commit([
          {
            prevCell: initialCell,
            nextCell: prevProps.cell,
          },
        ]);
      } else if (!coordsChanged && cell !== prevProps.cell) {
        commit([
          {
            prevCell: prevProps.cell,
            nextCell: cell,
          },
        ]);
      }
      initialCellRef.current = cell;
    }
  });

  const DataEditor = (cell && cell.DataEditor) || props.DataEditor;
  const readOnly = cell && cell.readOnly;

  return hidden ? null : (
    <div
      className={classnames(
        "Spreadsheet__active-cell",
        `Spreadsheet__active-cell--${mode}`
      )}
      style={{ width, height, top, left }}
      onClick={mode === "view" && !readOnly ? edit : undefined}
    >
      {mode === "edit" && (
        <DataEditor
          row={row}
          column={column}
          cell={cell}
          onChange={handleChange}
          getValue={getValue}
        />
      )}
    </div>
  );
}

function mapStateToProps<Cell: Types.CellBase>(
  state: Types.StoreState<Cell>
): $Shape<Props<Cell, *>> {
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
    mode: state.mode,
  };
}

// $FlowFixMe
export default connect(mapStateToProps, {
  setCellData: Actions.setCellData,
  edit: Actions.edit,
  commit: Actions.commit,
})(ActiveCell);
