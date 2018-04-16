// @flow

import React, { PureComponent } from "react";
import classnames from "classnames";
import { connect } from "unistore/react";
import * as PointSet from "./point-set";
import * as Matrix from "./matrix";
import * as Types from "./types";
import * as Actions from "./actions";
import { isActive } from "./util";

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
  data: Data,
  onSelectedRightEdge: boolean,
  onSelectedLeftEdge: boolean,
  onSelectedTopEdge: boolean,
  onSelectedBottomEdge: boolean,
  onCopiedRightEdge: boolean,
  onCopiedLeftEdge: boolean,
  onCopiedTopEdge: boolean,
  onCopiedBottomEdge: boolean
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
      setCellDimensions(
        { row, column },
        {
          width: this.root.offsetWidth,
          height: this.root.offsetHeight,
          left: this.root.offsetLeft,
          top: this.root.offsetTop
        }
      );
    }
    if (this.root && active && mode === "view") {
      this.root.focus();
    }
  }

  render() {
    const {
      row,
      column,
      selected,
      copied,
      DataViewer,
      getValue,
      active,
      mode,
      data,
      onSelectedRightEdge,
      onSelectedLeftEdge,
      onSelectedTopEdge,
      onSelectedBottomEdge,
      onCopiedRightEdge,
      onCopiedLeftEdge,
      onCopiedTopEdge,
      onCopiedBottomEdge
    } = this.props;
    return (
      <td
        ref={this.handleRoot}
        className={classnames(mode, {
          active,
          selected,
          copied,
          readonly: data && data.readOnly,
          "selected-right-edge": onSelectedRightEdge,
          "selected-left-edge": onSelectedLeftEdge,
          "selected-top-edge": onSelectedTopEdge,
          "selected-bottom-edge": onSelectedBottomEdge,
          "copied-right-edge": onCopiedRightEdge,
          "copied-left-edge": onCopiedLeftEdge,
          "copied-top-edge": onCopiedTopEdge,
          "copied-bottom-edge": onCopiedBottomEdge
        })}
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
  const onSelectedEdge = PointSet.onEdge(selected, point);
  const onCopiedEdge = PointSet.onEdge(copied, point);

  return {
    selected: cellIsSelected,
    active: cellIsActive,
    copied: PointSet.has(copied, point),
    mode: cellIsActive ? mode : "view",
    data: Matrix.get(row, column, data),
    onSelectedRightEdge: onSelectedEdge.right,
    onSelectedLeftEdge: onSelectedEdge.left,
    onSelectedTopEdge: onSelectedEdge.top,
    onSelectedBottomEdge: onSelectedEdge.bottom,
    onCopiedRightEdge: !hasPasted && onCopiedEdge.right,
    onCopiedLeftEdge: !hasPasted && onCopiedEdge.left,
    onCopiedTopEdge: !hasPasted && onCopiedEdge.top,
    onCopiedBottomEdge: !hasPasted && onCopiedEdge.bottom
  };
}

export default connect(mapStateToProps, () => ({
  select: Actions.select,
  activate: Actions.activate,
  setData: Actions.setData,
  setCellDimensions: Actions.setCellDimensions
}))(Cell);
