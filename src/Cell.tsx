import * as React from "react";
import classnames from "classnames";
import { connect } from "unistore/react";
import * as PointSet from "./point-set";
import * as PointMap from "./point-map";
import * as Matrix from "./matrix";
import * as Types from "./types";
import * as Actions from "./actions";
import { isActive, getOffsetRect } from "./util";

export const Cell = <Data extends Types.CellBase<Value>, Value>({
  row,
  column,
  setCellDimensions,
  select,
  activate,
  mode,
  dragging,
  getValue,
  formulaParser,
  selected,
  active,
  DataViewer,
  data,
}: Types.CellComponentProps<Data, Value>) => {
  const rootRef = React.useRef<HTMLTableDataCellElement | null>(null);
  const root = rootRef.current;

  const handleMouseDown = React.useCallback(
    (event: React.MouseEvent<HTMLTableDataCellElement>) => {
      if (mode === "view") {
        setCellDimensions({ row, column }, getOffsetRect(event.currentTarget));

        if (event.shiftKey) {
          select({ row, column });
        } else {
          activate({ row, column });
        }
      }
    },
    [mode, setCellDimensions, row, column, select, activate]
  );

  const handleMouseOver = React.useCallback(
    (event: React.MouseEvent<HTMLTableDataCellElement>) => {
      if (dragging) {
        setCellDimensions({ row, column }, getOffsetRect(event.currentTarget));
        select({ row, column });
      }
    },
    [setCellDimensions, select, dragging, row, column]
  );

  React.useEffect(() => {
    if (selected && root) {
      setCellDimensions({ row, column }, getOffsetRect(root));
    }
    if (root && active && mode === "view") {
      root.focus();
    }
  }, [setCellDimensions, root, select, active, mode, column, row, selected]);

  if (data && data.DataViewer) {
    // @ts-ignore
    DataViewer = data.DataViewer;
  }

  return (
    <td
      ref={rootRef}
      className={classnames("Spreadsheet__cell", data?.className, {
        "Spreadsheet__cell--readonly": data?.readOnly,
      })}
      onMouseOver={handleMouseOver}
      onMouseDown={handleMouseDown}
      tabIndex={0}
    >
      <DataViewer
        row={row}
        column={column}
        cell={data}
        getValue={getValue}
        formulaParser={formulaParser}
      />
    </td>
  );
};

function mapStateToProps<Data extends Types.CellBase<Value>, Value>(
  {
    data,
    active,
    selected,
    copied,
    mode,
    dragging,
    lastChanged,
    bindings,
  }: Types.StoreState<Data, Value>,
  { column, row }: Types.CellComponentProps<Data, Value>
) {
  const point = { row, column };
  const cellIsActive = isActive(active, point);

  const cellBindings = PointMap.get(point, bindings);

  return {
    active: cellIsActive,
    selected: PointSet.has(selected, point),
    copied: PointMap.has(point, copied),
    mode: cellIsActive ? mode : "view",
    data: Matrix.get(row, column, data),
    dragging,
    /** @todo refactor */
    // @ts-ignore
    _bindingChanged:
      cellBindings && lastChanged && PointSet.has(cellBindings, lastChanged)
        ? {}
        : null,
  };
}

export const enhance = connect(mapStateToProps, () => ({
  select: Actions.select,
  activate: Actions.activate,
  setCellDimensions: Actions.setCellDimensions,
}));
