import * as React from "react";
import classnames from "classnames";
import { connect } from "unistore/react";
import * as Matrix from "./matrix";
import * as Actions from "./actions";
import * as Types from "./types";
import * as Point from "./point";
import { getCellDimensions } from "./util";

type Props = {
  DataEditor: Types.DataEditorComponent;
  onChange: (data: Types.CellBase) => void;
  setCellData: (
    active: Point.Point,
    data: Types.CellBase,
    bindings: Point.Point[]
  ) => void;
  cell: Types.CellBase;
  hidden: boolean;
  mode: Types.Mode;
  edit: () => void;
  commit: (changes: Types.CellChange<Types.CellBase>[]) => void;
  getBindingsForCell: Types.GetBindingsForCell<Types.CellBase>;
  data: Matrix.Matrix<Types.CellBase>;
} & Point.Point &
  Types.Dimensions;

const ActiveCell: React.FC<Props> = (props) => {
  const {
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
    data,
  } = props;
  const initialCellRef = React.useRef<Types.CellBase | null>(null);
  const prevPropsRef = React.useRef<Props | null>(null);

  const handleChange = React.useCallback(
    (cell: Types.CellBase) => {
      const bindings = getBindingsForCell(cell, data);
      setCellData({ row, column }, cell, bindings);
    },
    [getBindingsForCell, setCellData, row, column, data]
  );

  React.useEffect(() => {
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
          // @ts-ignore
          onChange={handleChange}
        />
      )}
    </div>
  );
};

function mapStateToProps<Cell extends Types.CellBase>(
  state: Types.StoreState<Cell>
): Partial<Props> {
  const dimensions = state.active && getCellDimensions(state.active, state);
  if (!state.active || !dimensions) {
    return { hidden: true };
  }
  return {
    ...state.active,
    hidden: false,
    cell: Matrix.get(state.active, state.data),
    width: dimensions.width,
    height: dimensions.height,
    top: dimensions.top,
    left: dimensions.left,
    mode: state.mode,
    data: state.data,
  };
}

export default connect(mapStateToProps, {
  setCellData: Actions.setCellData,
  edit: Actions.edit,
  commit: Actions.commit,
  // @ts-ignore
})(ActiveCell);
