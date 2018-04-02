// @flow

import React, { PureComponent } from "react";
import type { ComponentType } from "react";
import createStore from "unistore";
import { Provider, connect } from "unistore/react";
import clipboard from "clipboard-polyfill";
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
import * as PointSet from "./point-set";
import * as Matrix from "./matrix";
import "./Spreadsheet.css";

type DefaultCellType = {
  value: string | number | boolean | null
};

const getValue = ({ data }: { data: DefaultCellType }) => data.value;

type Props<CellType, Value> = {|
  data: Matrix.Matrix<CellType>,
  Table: ComponentType<TableProps>,
  Row: ComponentType<RowProps>,
  Cell: ComponentType<CellProps<CellType, Value>>,
  DataViewer: Types.DataEditor<CellType, Value>,
  DataEditor: Types.DataViewer<CellType, Value>,
  getValue: Types.getValue<Cell, Value>
|};

type EventProps<CellType> = {|
  onChange: (data: Matrix.Matrix<CellType>) => void,
  onModeChange: (mode: Types.Mode) => void,
  onSelect: (selected: Types.Point[]) => void,
  onActivate: (active: Types.Point) => void
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
 * Fix backwards select
 * Multi Selection: drag select
 * Clipboard: copy, paste
 * Support getValue() return boolean by default
 * Bindings: trigger render for cells when a cell changes. props.getBindingsFromCell : (cellDescriptor) => Set<cellDescriptor>
 * Better Cell API
 * Advanced paste
 * Select delete
 * Floating Editor: Use select events to get coordinates instead of modifying the DOM (going back to old idea) this will yield flexibility for selected area, less DOM deep mutations and fix border styling
 * Auto resizing edit cell
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
}: $Rest<
  Props<CellType, Value>,
  {| data: Matrix.Matrix<CellType> |} & EventProps
> &
  State &
  Handlers<CellType>) => (
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

const mapStateToProps = ({ data }: Types.StoreState<*>): State =>
  Matrix.getSize(data);

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
  const { rows, columns } = Matrix.getSize(state.data);
  if (!state.active) {
    return null;
  }
  const nextActive = {
    row: state.active.row + rowDelta,
    column: state.active.column + columnDelta
  };
  if (!Matrix.has(nextActive.row, nextActive.column, state.data)) {
    return { mode: "view" };
  }
  return {
    active: nextActive,
    selected: PointSet.of([nextActive]),
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

const actions = <CellType>(store) => ({
  handleKeyPress(state: Types.StoreState<CellType>) {
    if (state.mode === "view" && state.active) {
      return { mode: "edit" };
    }
    return null;
  },
  handleKeyDown(
    state: Types.StoreState<CellType>,
    event: SyntheticKeyboardEvent<HTMLElement>
  ) {
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

const initialState: $Shape<Types.StoreState<*>> = {
  selected: PointSet.of([]),
  copied: PointSet.of([]),
  active: null,
  mode: "view"
};

type Unsubscribe = () => void;

type WrapperProps<CellType, Value> = Props<CellType, Value> &
  EventProps<CellType>;

export default class SpreadsheetWrapper<CellType, Value> extends PureComponent<
  WrapperProps<CellType, Value>
> {
  store: Object;
  unsubscribe: Unsubscribe;
  prevState: Types.StoreState<CellType>;

  constructor(props: WrapperProps<CellType, Value>) {
    super(props);
    const state: Types.StoreState<CellType> = {
      ...initialState,
      data: this.props.data
    };
    this.store = createStore(state);
    this.prevState = state;
  }

  componentDidMount() {
    const { onChange, onModeChange, onSelect, onActivate } = this.props;
    this.unsubscribe = this.store.subscribe(
      (state: Types.StoreState<CellType>) => {
        const { prevState } = this;
        if (state.data !== prevState.data) {
          onChange(state.data);
        }
        if (state.mode !== prevState.mode) {
          onModeChange(state.mode);
        }
        if (state.selected !== prevState.selected) {
          onSelect(PointSet.toArray(state.selected));
        }
        if (state.active !== prevState.active) {
          onActivate(state.active);
        }
        this.prevState = state;
      }
    );
    document.addEventListener("copy", (event: ClipboardEvent) => {
      event.preventDefault();
      event.stopPropagation();
      this.handleCopy(event);
    });
    document.addEventListener("cut", (event: ClipboardEvent) => {
      event.preventDefault();
      event.stopPropagation();
      this.handleCut(event);
    });
    document.addEventListener("paste", (event: ClipboardEvent) => {
      event.preventDefault();
      event.stopPropagation();
      this.handlePaste(event);
    });
  }

  handleCopy = (event: ClipboardEvent) => {
    const { data, selected } = this.store.getState();
    const matrix = PointSet.toMatrix(selected, data);
    const filteredMatrix = Matrix.filter(Boolean, matrix);
    const valueMatrix = Matrix.map(getValue, filteredMatrix);
    const copy = () => clipboard.writeText(Matrix.join(valueMatrix));
    if (navigator.permissions) {
      navigator.permissions
        .query({
          name: "clipboard-read"
        })
        .then(readClipboardStatus => {
          if (readClipboardStatus.state) {
            copy();
          }
        });
    } else {
      copy();
    }
    this.store.setState({ copied: selected, cut: false });
  };

  handleCut = (event: ClipboardEvent) => {
    this.handleCopy(event);
    this.store.setState({ cut: true });
  };

  handlePaste = (event: ClipboardEvent) => {
    const prevState = this.store.getState();
    this.store.setState({
      data: PointSet.toArray(prevState.copied).reduce(
        (acc, { row, column }) =>
          Matrix.set(
            row + prevState.active.row - 1,
            column + prevState.active.column - 1,
            Matrix.get(row, column, prevState.data),
            acc
          ),
        prevState.data
      ),
      selected: PointSet.map(
        point => ({
          row: point.row + prevState.active.row - 1,
          column: point.column + prevState.active.column - 1
        }),
        prevState.copied
      ),
      // copied: PointSet.of([]),
      cut: false
    });
  };

  componentDidUpdate(prevProps: Props<CellType, Value>) {
    if (prevProps.data !== this.props.data) {
      this.store.setState({ data: this.props.data });
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const { data, ...rest } = this.props;
    return (
      <Provider store={this.store}>
        <ConnectedSpreadsheet {...rest} />
      </Provider>
    );
  }
}
