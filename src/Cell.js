// @flow

import React, { PureComponent } from "react";
import classnames from "classnames";
import { connect } from "unistore/react";
import * as Selected from "./selected";
import * as Matrix from "./matrix";
import * as Types from "./types";
import { setCell } from "./util";

const isActive = (
  active: $PropertyType<Types.StoreState<*>, "active">,
  { row, column }: Types.CellPointer
): boolean => Boolean(active && column === active.column && row === active.row);

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
  return {
    selected: cellIsSelected,
    active: cellIsActive,
    mode: cellIsActive ? mode : "view",
    data: Matrix.get(row, column, data),
    isRightEdge:
      cellIsSelected && !Selected.has(selected, { row, column: column + 1 }),
    isLeftEdge:
      cellIsSelected && !Selected.has(selected, { row, column: column - 1 }),
    isTopEdge:
      cellIsSelected && !Selected.has(selected, { row: row - 1, column }),
    isBottomEdge:
      cellIsSelected && !Selected.has(selected, { row: row + 1, column })
  };
}

type Actions<Data> = (
  store: *
) => {
  [name: string]: (
    state: Types.StoreState<Data>,
    ...*
  ) => $Shape<Types.StoreState<Data>>
};

const actions: Actions<*> = store => ({
  select(state, cellPointer: Types.CellPointer) {
    if (state.active && !isActive(state.active, cellPointer)) {
      return {
        selected: Selected.of(
          Matrix.range(
            { row: state.active.row - 1, column: state.active.column - 1 },
            {
              row: cellPointer.row,
              column: cellPointer.column
            }
          )
        ),
        mode: "view"
      };
    }
    return null;
  },
  activate(state, cellPointer: Types.CellPointer) {
    return {
      selected: Selected.of([cellPointer]),
      active: cellPointer,
      mode: isActive(state.active, cellPointer) ? "edit" : "view"
    };
  },
  setData(state, data: *) {
    return {
      mode: "edit",
      /** @todo the fuck do I know this? */
      data: setCell(state, data)
    };
  }
});

export default connect(mapStateToProps, actions)(Cell);
