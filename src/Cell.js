// @flow

import React, { PureComponent } from "react";
import classnames from "classnames";
import { connect } from "unistore/react";
import * as PointSet from "./point-set";
import * as PointMap from "./point-map";
import * as Matrix from "./matrix";
import * as Types from "./types";
import * as Actions from "./actions";
import { isActive, getOffsetRect } from "./util";

type StaticProps<Data, Value> = {|
  row: number,
  column: number,
  DataViewer: Types.DataViewer<Data, Value>,
  getValue: Types.getValue<Data, Value>
|};

type State<Data> = {|
  selected: boolean,
  active: boolean,
  copied: boolean,
  mode: Types.Mode,
  data: ?Data
|};

type Handlers<Data> = {|
  setData: (data: Data) => void,
  select: (cellPointer: Types.Point) => void,
  activate: (cellPointer: Types.Point) => void,
  setCellDimensions: (point: Types.Point, dimensions: Types.Dimensions) => void
|};

export type Props<Data, Value> = {|
  ...StaticProps<Data, Value>,
  ...State<Data>,
  ...Handlers<Data>
|};

export class Cell<Data: { readOnly?: boolean }, Value> extends PureComponent<
  Props<Data, Value>
> {
  /** @todo update to new API */
  root: HTMLElement | null;
  handleRoot = (root: HTMLElement | null) => {
    this.root = root;
  };

  handleClick = (e: SyntheticMouseEvent<HTMLElement>) => {
    const { row, column, setCellDimensions, select, activate } = this.props;

    setCellDimensions({ row, column }, getOffsetRect(e.currentTarget));

    if (e.shiftKey) {
      select({ row, column });
      return;
    }

    activate({ row, column });
  };

  handleChange = (cell: Data) => {
    const { setData } = this.props;
    setData(cell);
  };

  componentDidUpdate() {
    const {
      row,
      column,
      active,
      selected,
      mode,
      setCellDimensions
    } = this.props;
    if (selected && this.root) {
      setCellDimensions({ row, column }, getOffsetRect(this.root));
    }
    if (this.root && active && mode === "view") {
      this.root.focus();
    }
  }

  render() {
    const { row, column, getValue } = this.props;
    let { DataViewer, data } = this.props;
    if (data && data.DataViewer) {
      ({ DataViewer, ...data } = data);
    }

    return (
      <td
        ref={this.handleRoot}
        className={classnames({ readonly: data && data.readOnly })}
        onClick={this.handleClick}
        tabIndex={0}
      >
        <DataViewer row={row} column={column} cell={data} getValue={getValue} />
      </td>
    );
  }
}

function mapStateToProps<Data>(
  { data, active, selected, copied, hasPasted, mode }: Types.StoreState<Data>,
  { column, row }: Props<Data, *>
): State<Data> {
  const point = { row, column };
  const cellIsActive = isActive(active, point);

  return {
    active: cellIsActive,
    selected: PointSet.has(selected, point),
    copied: PointMap.has(point, copied),
    mode: cellIsActive ? mode : "view",
    data: Matrix.get(row, column, data)
  };
}

export const enhance = connect(mapStateToProps, () => ({
  select: Actions.select,
  activate: Actions.activate,
  setData: Actions.setData,
  setCellDimensions: Actions.setCellDimensions
}));
