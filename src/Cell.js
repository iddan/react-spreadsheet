// @flow

import React, { PureComponent } from "react";
import classnames from "classnames";
import { connect } from "unistore/react";
import * as Selected from "./selected";
import * as Matrix from "./matrix";
import * as Types from "./types";
import * as Actions from "./actions";
import { isActive } from "./util";

export type Props<Data, Value> = {
  row: number,
  column: number,
  DataEditor: Types.DataEditor<Data, Value>,
  DataViewer: Types.DataViewer<Data, Value>,
  getValue: Types.getValue<Data, Value>
};

type State<Data> = {|
  selected: boolean,
  active: boolean,
  mode: Types.Mode,
  data: Data,
  isRightEdge: boolean,
  isLeftEdge: boolean,
  isTopEdge: boolean,
  isBottomEdge: boolean
|};

type Handlers<Data> = {|
  setData: (data: Data) => void,
  select: (cellPointer: Types.CellPointer) => void,
  activate: (cellPointer: Types.CellPointer) => void
|};

class Cell<Data: { readOnly?: boolean }, Value> extends PureComponent<
  Props<Data, Value> & State<Data> & Handlers<Data>
> {
  /** @todo update to new API */
  root: HTMLElement | null;
  handleRoot = (root: HTMLElement | null) => {
    this.root = root;
  };

  handleClick = (e: SyntheticMouseEvent<HTMLElement>) => {
    const { row, column, select, activate } = this.props;
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

  /** @todo update to new API */
  componentDidUpdate() {
    const { selected, mode } = this.props;
    if (this.root && selected && mode === "view") {
      this.root.focus();
    }
  }

  render() {
    const {
      row,
      column,
      selected,
      DataEditor,
      DataViewer,
      getValue,
      active,
      mode,
      data,
      isRightEdge,
      isLeftEdge,
      isTopEdge,
      isBottomEdge
    } = this.props;
    return (
      <td
        ref={this.handleRoot}
        className={classnames(mode, {
          active,
          selected,
          readonly: data && data.readOnly,
          "right-edge": isRightEdge,
          "left-edge": isLeftEdge,
          "top-edge": isTopEdge,
          "bottom-edge": isBottomEdge
        })}
        onClick={this.handleClick}
        tabIndex={0}
      >
        {mode === "edit" ? (
          <DataEditor
            row={row}
            column={column}
            cell={data}
            getValue={getValue}
            onChange={this.handleChange}
          />
        ) : (
          <DataViewer
            row={row}
            column={column}
            cell={data}
            getValue={getValue}
          />
        )}
      </td>
    );
  }
}

function mapStateToProps<Data>(
  { data, active, selected, mode }: Types.StoreState<Data>,
  { column, row }: Props<Data, *>
): State<Data> {
  const cellIsActive = isActive(active, { column, row });
  const cellIsSelected = Selected.has(selected, { row, column });

  let edge = (rowDelta: number, columnDelta: number): boolean =>
    cellIsSelected &&
    !Selected.has(selected, {
      row: row + rowDelta,
      column: column + columnDelta
    });

  return {
    selected: cellIsSelected,
    active: cellIsActive,
    mode: cellIsActive ? mode : "view",
    data: Matrix.get(row, column, data),
    isRightEdge: edge(0, 1),
    isLeftEdge: edge(0, -1),
    isTopEdge: edge(-1, 0),
    isBottomEdge: edge(1, 0)
  };
}

export default connect(mapStateToProps, () => ({
  select: Actions.select,
  activate: Actions.activate,
  setData: Actions.setData
}))(Cell);
