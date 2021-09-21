import * as React from "react";
import classnames from "classnames";
import * as Matrix from "./matrix";
import * as Actions from "./actions";
import * as Types from "./types";
import * as Point from "./point";
import useSelector from "./use-selector";
import useDispatch from "./use-dispatch";
import { getCellDimensions } from "./util";

type Props = {
  DataEditor: Types.DataEditorComponent;
  getBindingsForCell: Types.GetBindingsForCell<Types.CellBase>;
};

const ActiveCell: React.FC<Props> = (props) => {
  const { getBindingsForCell } = props;

  const dispatch = useDispatch();
  const setCellData = React.useCallback(
    (active: Point.Point, data: Types.CellBase) =>
      dispatch(Actions.setCellData({ active, data, getBindingsForCell })),
    [dispatch, getBindingsForCell]
  );
  const edit = React.useCallback(() => dispatch(Actions.edit()), [dispatch]);
  const commit = React.useCallback(
    (changes: Types.CommitChanges<Types.CellBase>) =>
      dispatch(Actions.commit({ changes })),
    [dispatch]
  );
  const active = useSelector((state) => state.active);
  const mode = useSelector((state) => state.mode);
  const cell = useSelector((state) =>
    state.active ? Matrix.get(state.active, state.data) : undefined
  );
  const dimensions = useSelector((state) =>
    active
      ? getCellDimensions(active, state.rowDimensions, state.columnDimensions)
      : undefined
  );
  const hidden = React.useMemo(
    () => !active || !dimensions,
    [active, dimensions]
  );

  const initialCellRef = React.useRef<Types.CellBase | undefined>(undefined);
  const prevActiveRef = React.useRef<Point.Point | null>(null);
  const prevCellRef = React.useRef<Types.CellBase | undefined>(undefined);

  const handleChange = React.useCallback(
    (cell: Types.CellBase) => {
      if (!active) {
        return;
      }
      setCellData(active, cell);
    },
    [setCellData, active]
  );

  React.useEffect(() => {
    const prevActive = prevActiveRef.current;
    const prevCell = prevCellRef.current;
    prevActiveRef.current = active;
    prevCellRef.current = cell;

    if (!prevActive || !prevCell) {
      return;
    }

    // Commit
    const coordsChanged =
      active?.row !== prevActive.row || active?.column !== prevActive.column;
    const exitedEditMode = mode !== "edit";

    if (coordsChanged || exitedEditMode) {
      const initialCell = initialCellRef.current;
      if (prevCell !== initialCell) {
        commit([
          {
            prevCell: initialCell || null,
            nextCell: prevCell,
          },
        ]);
      } else if (!coordsChanged && cell !== prevCell) {
        commit([
          {
            prevCell,
            nextCell: cell || null,
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
      style={dimensions}
      onClick={mode === "view" && !readOnly ? edit : undefined}
    >
      {mode === "edit" && active && (
        <DataEditor
          row={active.row}
          column={active.column}
          cell={cell}
          // @ts-ignore
          onChange={handleChange}
        />
      )}
    </div>
  );
};

export default ActiveCell;
