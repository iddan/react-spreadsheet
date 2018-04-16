// @flow

import React, { PureComponent } from "react";
import classnames from "classnames";
import { connect } from "unistore/react";
import * as PointSet from "./point-set";
import * as Matrix from "./matrix";
import * as Types from "./types";
import * as Actions from "./actions";
import { isActive, getOffsetRect } from "./util";

export type Props<Data, Value> = {
  row: number,
  column: number,
  DataViewer: Types.DataViewer<Data, Value>,
  getValue: Types.getValue<Data, Value>
};

type State<Data> = {|
  selected: boolean,
  active: boolean,
  copied: boolean,
  mode: Types.Mode,
  data: Data
|};

type Handlers<Data> = {|
  setData: (data: Data) => void,
  select: (cellPointer: Types.Point) => void,
  activate: (cellPointer: Types.Point) => void,
  setCellDimensions: (point: Types.Point, dimensions: Types.Dimensions) => void
|};

class Cell<Data: { readOnly?: boolean }, Value> extends PureComponent<
  Props<Data, Value> & State<Data> & Handlers<Data>
> {
  /** @todo update to new API */
  root: HTMLElement | null;
  handleRoot = (root: HTMLElement | null) => {
    this.root = root;
  };

  activate = () => {
    const { row, column, activate } = this.props;
    activate({ row, column });
  };

  handleClick = (e: SyntheticMouseEvent<HTMLElement>) => {
    const { row, column, select } = this.props;
    if (e.shiftKey) {
      select({ row, column });
      return;
    }
    this.activate();
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
    const { row, column, DataViewer, getValue, data } = this.props;
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
  const cellIsSelected = PointSet.has(selected, point);

  return {
    selected: cellIsSelected,
    active: cellIsActive,
    copied: PointSet.has(copied, point),
    mode: cellIsActive ? mode : "view",
    data: Matrix.get(row, column, data)
  };
}

export default connect(mapStateToProps, () => ({
  select: Actions.select,
  activate: Actions.activate,
  setData: Actions.setData,
  setCellDimensions: Actions.setCellDimensions
}))(Cell);
