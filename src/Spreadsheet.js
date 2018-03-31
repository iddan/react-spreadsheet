// @flow

import React, { PureComponent } from "react";
import type { ComponentType } from "react";
import createStore from "unistore";
import { Provider, connect } from "unistore/react";
import * as Types from "./types";
import Table from "./Table";
import type { Props as TableProps } from "./Table";
import Row from "./Row";
import type { Props as RowProps } from "./Row";
import Cell from "./Cell";
import type { Props as CellProps } from "./Cell";
import DataViewer from "./DataViewer";
import DataEditor from "./DataEditor";
import { range, setCell } from "./util";
import * as Selected from "./selected";
import "./Spreadsheet.css";

type DefaultCellType = {
  value: string | number | boolean | null
};

const getValue = ({ data }: { data: DefaultCellType }) => data.value;

type Data<CellType> = CellType[][];

type Props<CellType, Value> = {|
  data: Data<CellType>,
  Table: ComponentType<TableProps>,
  Row: ComponentType<RowProps>,
  Cell: ComponentType<CellProps<CellType, Value>>,
  DataViewer: Types.DataEditor<CellType, Value>,
  DataEditor: Types.DataViewer<CellType, Value>,
  getValue: Types.getValue<Cell, Value>
|};

type State = {|
  rows: number,
  columns: number
|};

type Handlers<Cell> = {|
  handleKeyPress: (
    state: Types.StoreState<Cell>,
    event: SyntheticKeyboardEvent<*>
  ) => void,
  handleKeyDown: (
    state: Types.StoreState<Cell>,
    event: SyntheticKeyboardEvent<*>
  ) => void
|};

/**
 * @todo
 * Proper sync props & state on cells
 * Normalize keyboard navigation and fix edge cases
 * Use select events to get coordinates instead of modifying the DOM (going back to old idea) this will yield flexibility for selected area, less DOM deep mutations and fix border styling
 * Multi Selection: drag select
 * Clipboard: copy, paste, select copy, select paste
 * Support getValue() return boolean by default
 * Bindings: trigger render for cells when a cell changes. props.getBindingsFromCell : (cellDescriptor) => Set<cellDescriptor>
 * Propagate events: Use store.subscribe to emit changes
 */
const Spreadsheet = <CellType, Value>({
  Table,
  Row,
  Cell,
  DataViewer,
  DataEditor,
  getValue,
  rows,
  columns,
  handleKeyPress,
  handleKeyDown
}: {|
  ...$Rest<Props<CellType, Value>, {| data: Data<CellType> |}>,
  ...State,
  ...Handlers<CellType>
|}) => (
  <Table onKeyPress={handleKeyPress} onKeyDown={handleKeyDown}>
    {range(rows).map(rowNumber => (
      <Row key={rowNumber}>
        {range(columns).map(columnNumber => (
          <Cell
            key={columnNumber}
            row={rowNumber}
            column={columnNumber}
            DataViewer={DataViewer}
            DataEditor={DataEditor}
            getValue={getValue}
          />
        ))}
      </Row>
    ))}
  </Table>
);

Spreadsheet.defaultProps = {
  Table,
  Row,
  Cell,
  DataViewer,
  DataEditor,
  getValue
};

const mapStateToProps = ({ data }: Types.StoreState<*>): State => {
  const [firstRow] = data;
  return {
    rows: data.length,
    columns: firstRow ? firstRow.length : 0
  };
};

type KeyDownHandler<Cell> = (
  state: Types.StoreState<Cell>,
  event: SyntheticKeyboardEvent<*>
) => $Shape<Types.StoreState<Cell>>;

type KeyDownHandlers<Cell> = {
  [eventType: string]: KeyDownHandler<Cell>
};

const go = (rowDelta: number, columnDelta: number): KeyDownHandler<*> => (
  state,
  event
) => {
  if (!state.active) {
    return null;
  }
  const nextActive = {
    row: state.active.row + rowDelta,
    column: state.active.column + columnDelta
  };
  return {
    active: nextActive,
    selected: Selected.of([nextActive]),
    mode: "view"
  };
};

/** @todo replace to real func */
const cellFromValue = value => ({ value });

/** @todo handle inactive state? */
const keyDownHandlers: KeyDownHandlers<*> = {
  ArrowUp: go(-1, 0),
  ArrowDown: go(+1, 0),
  ArrowLeft: go(0, -1),
  ArrowRight: go(0, +1),
  Tab: go(0, +1),
  Enter: (state, event) => ({
    mode: "edit"
  }),
  /** @todo test */
  Backspace: (state, event) => {
    if (!state.active) {
      return null;
    }
    return {
      data: setCell(state, cellFromValue("")),
      mode: "edit"
    };
  }
};

const editKeyDownHandlers: KeyDownHandlers<*> = {
  Escape: (state, event) => ({
    mode: "view"
  }),
  Tab: keyDownHandlers.Tab,
  Enter: keyDownHandlers.ArrowDown
};

const actions = store => ({
  handleKeyPress(state, event) {
    const { key } = event;
    if (state.mode === "view" && state.active) {
      return {
        mode: "edit",
        /** @todo the fuck do I know this? */
        data: setCell(state, cellFromValue(key))
      };
    }
    return null;
  },
  handleKeyDown(state, event) {
    const { key, nativeEvent } = event;
    const handlers =
      state.mode === "edit" ? editKeyDownHandlers : keyDownHandlers;
    const handler = handlers[key];
    if (handler) {
      nativeEvent.preventDefault();
      return handler(state, event);
    }
    return null;
  }
});

const ConnectedSpreadsheet = connect(mapStateToProps, actions)(Spreadsheet);

export default class SpreadsheetWrapper extends PureComponent<Props<*>> {
  store = createStore({
    data: this.props.data,
    selected: Selected.of([]),
    active: null,
    mode: "view"
  });

  render() {
    return (
      <Provider store={this.store}>
        <ConnectedSpreadsheet />
      </Provider>
    );
  }
}
