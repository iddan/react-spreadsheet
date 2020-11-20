import * as React from "react";
import classnames from "classnames";
import { connect } from "unistore/react";
import { Parser as FormulaParser } from "hot-formula-parser";
import * as PointSet from "./point-set";
import * as PointMap from "./point-map";
import * as Matrix from "./matrix";
import * as Types from "./types";
import * as Actions from "./actions";
import { isActive, getOffsetRect } from "./util";

type StaticProps<Value, Data extends Types.CellBase<Value>> = {
  row: number;
  column: number;
  DataViewer: Types.DataViewer<Data, Value>;
  getValue: Types.GetValue<Data, Value>;
  formulaParser: FormulaParser;
};

export { StaticProps as Props };

type State<Value, Data extends Types.CellBase<Value>> = {
  selected: boolean;
  active: boolean;
  copied: boolean;
  dragging: boolean;
  mode: Types.Mode;
  data: Data | null;
  _bindingChanged: Object | null;
};

type Handlers = {
  select: (cellPointer: Types.Point) => void;
  activate: (cellPointer: Types.Point) => void;
  setCellDimensions: (point: Types.Point, dimensions: Types.Dimensions) => void;
};

type Props<Value, Data extends Types.CellBase<Value>> = StaticProps<
  Value,
  Data
> &
  State<Value, Data> &
  Handlers;

export const Cell = <Value, Data extends Types.CellBase<Value>>({
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
}: Props<Value, Data>) => {
  const rootRef = React.useRef<HTMLTableDataCellElement>();
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
    [mode, setCellDimensions, row, column, getOffsetRect, select, activate]
  );

  const handleMouseOver = React.useCallback(
    (event: React.MouseEvent<HTMLTableDataCellElement>) => {
      if (dragging) {
        setCellDimensions({ row, column }, getOffsetRect(event.currentTarget));
        select({ row, column });
      }
    },
    [setCellDimensions, getOffsetRect, select, dragging, row, column]
  );

  React.useEffect(() => {
    if (selected && root) {
      setCellDimensions({ row, column }, getOffsetRect(root));
    }
    if (root && active && mode === "view") {
      root.focus();
    }
  }, [setCellDimensions, getOffsetRect, root, select, active, mode]);

  if (data && data.DataViewer) {
    // @ts-ignore
    DataViewer = data.DataViewer;
  }

  return (
    <td
      ref={rootRef}
      className={classnames(
        "Spreadsheet__cell",
        data && data.readOnly && "Spreadsheet__cell--readonly",
        data && data.className
      )}
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

function mapStateToProps<Value, Data extends Types.CellBase<Value>>(
  {
    data,
    active,
    selected,
    copied,
    hasPasted,
    mode,
    dragging,
    lastChanged,
    bindings,
  }: Types.StoreState<Value, Data>,
  { column, row }: Props<Value, Data>
): State<Value, Data> {
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
