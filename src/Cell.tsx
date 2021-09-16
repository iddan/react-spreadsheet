import * as React from "react";
import classnames from "classnames";
import { useContextSelector } from "use-context-selector";
import * as PointSet from "./point-set";
import * as PointMap from "./point-map";
import * as PointRange from "./point-range";
import * as Matrix from "./matrix";
import * as Types from "./types";
import * as Point from "./point";
import * as Actions from "./actions";
import context from "./context";
import { isActive, getOffsetRect } from "./util";

export const Cell: React.FC<Types.CellComponentProps> = ({
  row,
  column,
  DataViewer,
  formulaParser,
  selected,
  active,
  dragging,
  mode,
  data,
  select,
  activate,
  setCellDimensions,
}): React.ReactElement => {
  const rootRef = React.useRef<HTMLTableCellElement | null>(null);
  const point = React.useMemo(
    (): Point.Point => ({
      row,
      column,
    }),
    [row, column]
  );

  const handleMouseDown = React.useCallback(
    (event: React.MouseEvent<HTMLTableCellElement>) => {
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
    (event: React.MouseEvent<HTMLTableCellElement>) => {
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

export const enhance = (
  CellComponent: React.FC<Types.CellComponentProps>
): React.FC<Omit<Types.CellComponentProps, "selected" | "active" | "copied" | "dragging" | "mode" | "data" | "select" | "activate" | "setCellDimensions">> => {
  return function CellWrapper(props) {
    const { row, column } = props;
    const dispatch = useContextSelector(
      context,
      ([state, dispatch]) => dispatch
    );
    const select = React.useCallback(
      (point: Point.Point) => dispatch(Actions.select({ point })),
      [dispatch]
    );
    const activate = React.useCallback(
      (point: Point.Point) => dispatch(Actions.activate({ point })),
      [dispatch]
    );
    const setCellDimensions = React.useCallback(
      (point: Point.Point, dimensions: Types.Dimensions) =>
        dispatch(Actions.setCellDimensions({ point, dimensions })),
      [dispatch]
    );
    const active = useContextSelector(context, ([state]) => state.active);
    const mode = useContextSelector(context, ([state]) => state.mode);
    const data = useContextSelector(context, ([state]) =>
      Matrix.get({ row, column }, state.data)
    );
    const selected = useContextSelector(context, ([state]) =>
      state.selected ? PointRange.has(state.selected, { row, column }) : false
    );
    const dragging = useContextSelector(context, ([state]) => state.dragging);
    const copied = useContextSelector(context, ([state]) =>
      PointMap.has({ row, column }, state.copied)
    );

    // Use only to trigger re-render when cell bindings change
    useContextSelector(context, ([state]) => {
      const point = { row, column };
      const cellBindings = PointMap.get(point, state.bindings);
      return cellBindings &&
        state.lastChanged &&
        PointSet.has(cellBindings, state.lastChanged)
        ? {}
        : null;
    });
    const cellIsActive = isActive(active, {
      row,
      column,
    });
    const cellMode = cellIsActive ? mode : "view";
    return (
      <CellComponent
        {...props}
        selected={selected}
        active={cellIsActive}
        copied={copied}
        dragging={dragging}
        mode={cellMode}
        data={data}
        select={select}
        activate={activate}
        setCellDimensions={setCellDimensions}
      />
    );
  };
};
