import * as React from "react";
import classnames from "classnames";
import { connect } from "unistore/react";
import * as PointSet from "./point-set";
import * as PointMap from "./point-map";
import * as PointRange from "./point-range";
import * as Matrix from "./matrix";
import * as Types from "./types";
import * as UnistoreActions from "./unistore-actions";
import * as Point from "./point";
import { isActive, getOffsetRect } from "./util";

export const Cell: React.FC<Types.CellComponentProps> = ({
  row,
  column,
  setCellDimensions,
  select,
  activate,
  mode,
  dragging,
  formulaParser,
  selected,
  active,
  DataViewer,
  data,
}): React.ReactElement => {
  const rootRef = React.useRef<HTMLTableDataCellElement | null>(null);
  const point = React.useMemo(
    (): Point.Point => ({
      row,
      column,
    }),
    [row, column]
  );

  const handleMouseDown = React.useCallback(
    (event: React.MouseEvent<HTMLTableDataCellElement>) => {
      if (mode === "view") {
        setCellDimensions(point, getOffsetRect(event.currentTarget));

        if (event.shiftKey) {
          select(point);
        } else {
          activate(point);
        }
      }
    },
    [mode, setCellDimensions, point, select, activate]
  );

  const handleMouseOver = React.useCallback(
    (event: React.MouseEvent<HTMLTableDataCellElement>) => {
      if (dragging) {
        setCellDimensions(point, getOffsetRect(event.currentTarget));
        select(point);
      }
    },
    [setCellDimensions, select, dragging, point]
  );

  React.useEffect(() => {
    const root = rootRef.current;
    if (selected && root) {
      setCellDimensions(point, getOffsetRect(root));
    }
    if (root && active && mode === "view") {
      root.focus();
    }
  }, [setCellDimensions, selected, active, mode, point]);

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
        formulaParser={formulaParser}
      />
    </td>
  );
};

function mapStateToProps<Data extends Types.CellBase>(
  {
    data,
    active,
    selected,
    copied,
    mode,
    dragging,
    lastChanged,
    bindings,
  }: Types.StoreState<Data>,
  { column, row }: Types.CellComponentProps<Data>
) {
  const point: Point.Point = { row, column };
  const cellIsActive = isActive(active, point);

  const cellBindings = PointMap.get(point, bindings);

  return {
    active: cellIsActive,
    selected: selected ? PointRange.has(selected, point) : false,
    copied: PointMap.has(point, copied),
    mode: cellIsActive ? mode : "view",
    data: Matrix.get({ row, column }, data),
    dragging,
    // @ts-ignore
    _bindingChanged:
      cellBindings && lastChanged && PointSet.has(cellBindings, lastChanged)
        ? {}
        : null,
  };
}

export const enhance = connect(mapStateToProps, () => ({
  select: UnistoreActions.select,
  activate: UnistoreActions.activate,
  setCellDimensions: UnistoreActions.setCellDimensions,
}));
