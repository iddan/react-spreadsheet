// @flow

import React, { PureComponent } from "react";
import classnames from "classnames";
import { connect } from "unistore/react";
import * as Selected from "./selected";
import * as Types from "./types";
import { setCell } from "./util";

export type Props<Data, Value> = {
  row: number,
  column: number,
  DataEditor: Types.DataEditor<Data, Value>,
  DataViewer: Types.DataViewer<Data, Value>,
  getValue: Types.getValue<Data, Value>
};

type State<Data> = {
  selected: boolean,
  active: boolean,
  mode: Types.Mode,
  data: Data
};

type Handlers<Data> = {
  setData: (data: Data) => void,
  select: (cellPointer: Types.CellPointer) => void
};

class Cell<Data: { readOnly?: boolean }, Value> extends PureComponent<{
  ...Props<Data, Value>,
  ...State<Data>,
  ...Handlers<Data>
}> {
  root: HTMLElement | null;

  handleRoot = (root: HTMLElement | null) => {
    const { selected, mode } = this.props;
    if (this.root && selected && mode === "view") {
      this.root.focus();
    }
  };

  handleClick = () => {
    const { row, column, select } = this.props;
    select({ row, column });
  };

  handleChange = (cell: Data) => {
    const { setData } = this.props;
    setData(cell);
  };

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
      select,
      handleValueChange
    } = this.props;
    return (
      <td
        ref={this.handleRoot}
        className={classnames(mode, {
          active,
          selected,
          readonly: data && data.readOnly
        })}
        onClick={select}
        tabIndex={0}
      >
        {mode === "edit" ? (
          <DataEditor
            row={row}
            column={column}
            cell={data}
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
  const cellIsActive = Boolean(
    active && column === active.column && row === active.row
  );
  return {
    selected: Selected.has(selected, { row, column }),
    active: cellIsActive,
    mode: cellIsActive ? mode : "view",
    data: data[row][column]
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
  select(state, cellPointer: Types.CellPointer, active) {
    return {
      selected: Selected.add(cellPointer),
      active: active ? cellPointer : state.active
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
