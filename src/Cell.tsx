import React, { Node } from "react";
import classnames from "classnames";
import unistoreReact from "unistore/react";
import { Parser as FormulaParser } from "hot-formula-parser";
import * as PointSet from "./point-set";
import * as PointMap from "./point-map";
import * as Matrix from "./matrix";
import * as Types from "./types";
import * as Actions from "./actions";
import { isActive, getOffsetRect } from "./util";

type StaticProps<Data, Value> = {
  row: number;
  column: number;
  DataViewer: Types.DataViewer<Data, Value>;
  getValue: Types.getValue<Data, Value>;
  formulaParser: FormulaParser;
};

export { StaticProps as Props };

type State<Data> = {
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

type Props<Data, Value> = {} & StaticProps<Data, Value> &
  State<Data> &
  Handlers;

export class Cell<
  Data extends Types.CellBase,
  Value
> extends React.PureComponent<Props<Data, Value>> {
  /** @todo update to new API */
  root: HTMLElement | null;

  handleRoot = (root: HTMLElement | null) => {
    this.root = root;
  };

  handleMouseDown = (e: React.MouseEvent) => {
    const {
      row,
      column,
      setCellDimensions,
      select,
      activate,
      mode,
    } = this.props;
    if (mode === "view") {
      setCellDimensions({ row, column }, getOffsetRect(e.currentTarget));

      if (e.shiftKey) {
        select({ row, column });
        return;
      }

      activate({ row, column });
    }
  };

  handleMouseOver = (e: React.MouseEvent) => {
    const { row, column, dragging, setCellDimensions, select } = this.props;
    if (dragging) {
      setCellDimensions({ row, column }, getOffsetRect(e.currentTarget));
      select({ row, column });
    }
  };

  componentDidUpdate() {
    const {
      row,
      column,
      active,
      selected,
      mode,
      setCellDimensions,
    } = this.props;
    if (selected && this.root) {
      setCellDimensions({ row, column }, getOffsetRect(this.root));
    }
    if (this.root && active && mode === "view") {
      this.root.focus();
    }
  }

  render(): Node {
    const { row, column, getValue, formulaParser } = this.props;
    let { DataViewer, data } = this.props;
    if (data && data.DataViewer) {
      ({ DataViewer, ...data } = data);
    }

    return (
      <td
        ref={this.handleRoot}
        className={classnames(
          "Spreadsheet__cell",
          data && data.readOnly && "Spreadsheet__cell--readonly",
          data && data.className
        )}
        onMouseOver={this.handleMouseOver}
        onMouseDown={this.handleMouseDown}
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
  }
}

function mapStateToProps<Data extends Types.CellBase>(
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
  }: Types.StoreState<Data>,
  { column, row }: Props<Data, unknown>
): State<Data> {
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

export const enhance = unistoreReact.connect(mapStateToProps, () => ({
  select: Actions.select,
  activate: Actions.activate,
  setCellDimensions: Actions.setCellDimensions,
}));
