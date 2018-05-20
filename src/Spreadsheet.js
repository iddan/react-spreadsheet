// @flow

import React, { PureComponent } from "react";
import type { ComponentType } from "react";
import createStore from "unistore";
import devtools from "unistore/devtools";
import { Provider, connect } from "unistore/react";
import clipboard from "clipboard-polyfill";
import * as Types from "./types";
import Table from "./Table";
import type { Props as TableProps } from "./Table";
import Row from "./Row";
import type { Props as RowProps } from "./Row";
import { Cell, enhance as enhanceCell } from "./Cell";
import type { Props as CellProps } from "./Cell";
import DataViewer from "./DataViewer";
import DataEditor from "./DataEditor";
import ActiveCell from "./ActiveCell";
import Selected from "./Selected";
import Copied from "./Copied";
import { range } from "./util";
import * as PointSet from "./point-set";
import * as PointMap from "./point-map";
import * as Matrix from "./matrix";
import * as Actions from "./actions";
import "./Spreadsheet.css";

declare class ClipboardEvent extends Event {
  clipboardData: DataTransfer;
}

type DefaultCellType = {
  value: string | number | boolean | null
};

const getValue = ({ data }: { data: ?DefaultCellType }) =>
  data ? data.value : null;

type Props<CellType, Value> = {|
  data: Matrix.Matrix<CellType>,
  Table: ComponentType<TableProps>,
  Row: ComponentType<RowProps>,
  Cell: ComponentType<CellProps<CellType, Value>>,
  DataViewer: Types.DataEditor<CellType, Value>,
  DataEditor: Types.DataViewer<CellType, Value>,
  getValue: Types.getValue<CellType, Value>
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

type Handlers = {|
  handleKeyPress: (event: SyntheticKeyboardEvent<*>) => void,
  handleKeyDown: (event: SyntheticKeyboardEvent<*>) => void
|};

const Spreadsheet = <CellType, Value>({
  Table,
  Row,
  Cell,
  DataViewer,
  getValue,
  rows,
  columns,
  handleKeyPress,
  handleKeyDown
}: {|
  ...$Diff<
    Props<CellType, Value>,
    {|
      data: Matrix.Matrix<CellType>
    |}
  >,
  ...State,
  ...Handlers
|}) => (
  <div
    className="Spreadsheet"
    onKeyPress={handleKeyPress}
    onKeyDown={handleKeyDown}
  >
    <Table>
      {range(rows).map(rowNumber => (
        <Row key={rowNumber}>
          {range(columns).map(columnNumber => (
            <Cell
              key={columnNumber}
              row={rowNumber}
              column={columnNumber}
              DataViewer={DataViewer}
              getValue={getValue}
            />
          ))}
        </Row>
      ))}
    </Table>
    <ActiveCell DataEditor={DataEditor} getValue={getValue} />
    <Selected />
    <Copied />
  </div>
);

Spreadsheet.defaultProps = {
  Table,
  Row,
  /** @todo enhance incoming Cell prop */
  Cell: enhanceCell(Cell),
  DataViewer,
  DataEditor,
  getValue
};

const mapStateToProps = ({ data }: Types.StoreState<*>): State =>
  Matrix.getSize(data);

type KeyDownHandlers<Cell> = {
  [eventType: string]: Actions.KeyDownHandler<Cell>
};

/** @todo handle inactive state? */
const keyDownHandlers: KeyDownHandlers<*> = {
  ArrowUp: Actions.go(-1, 0),
  ArrowDown: Actions.go(+1, 0),
  ArrowLeft: Actions.go(0, -1),
  ArrowRight: Actions.go(0, +1),
  Tab: Actions.go(0, +1),
  Enter: Actions.edit,
  Backspace: Actions.unfocus
};

const editKeyDownHandlers: KeyDownHandlers<*> = {
  Escape: Actions.view,
  Tab: keyDownHandlers.Tab,
  Enter: keyDownHandlers.ArrowDown
};

const shiftKeyDownHandlers: KeyDownHandlers<*> = {
  ArrowUp: Actions.modifyEdge("row", -1),
  ArrowDown: Actions.modifyEdge("row", 1),
  ArrowLeft: Actions.modifyEdge("column", -1),
  ArrowRight: Actions.modifyEdge("column", 1)
};

function actions<CellType>(store) {
  return {
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
      let handlers;
      // Order matters
      if (state.mode === "edit") {
        handlers = editKeyDownHandlers;
      } else if (event.shiftKey) {
        handlers = shiftKeyDownHandlers;
      } else {
        handlers = keyDownHandlers;
      }
      const handler = handlers[key];
      if (handler) {
        nativeEvent.preventDefault();
        return handler(state, event);
      }
      return null;
    }
  };
}

const ConnectedSpreadsheet = connect(mapStateToProps, actions)(Spreadsheet);

const initialState: $Shape<Types.StoreState<*>> = {
  selected: PointSet.from([]),
  copied: PointMap.from([]),
  active: null,
  mode: "view",
  cellDimensions: PointMap.from([])
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

  static defaultProps = {
    onChange: () => {},
    onModeChange: () => {},
    onSelect: () => {},
    onActivate: () => {}
  };

  constructor(props: WrapperProps<CellType, Value>) {
    super(props);
    const state: Types.StoreState<CellType> = {
      ...initialState,
      data: this.props.data
    };
    this.store =
      process.env.NODE_ENV === "production"
        ? createStore(state)
        : devtools(createStore(state));
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
        if (state.active !== prevState.active && state.active) {
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

  /**
   * Apply an action on the state and set it's result,
   * like actions of mapStateToProps() but for top level
   */
  dispatch = (
    action: (Types.StoreState<CellType>) => $Shape<Types.StoreState<CellType>>
  ) => {
    this.store.setState(action(this.store.getState()));
  };

  /**
   * Save selected cells as CSV to the clipboard
   */
  clip = () => {
    const { data, selected } = this.store.getState();
    const matrix = PointSet.toMatrix(selected, data);
    const filteredMatrix = Matrix.filter(Boolean, matrix);
    const valueMatrix = Matrix.map(getValue, filteredMatrix);
    const write = () => clipboard.writeText(Matrix.join(valueMatrix));
    if (navigator.permissions) {
      navigator.permissions
        .query({
          name: "clipboard-read"
        })
        .then(readClipboardStatus => {
          if (readClipboardStatus.state) {
            write();
          }
        });
    } else {
      write();
    }
  };

  handleCopy = (event: ClipboardEvent) => {
    this.clip();
    this.dispatch(Actions.copy);
  };

  handleCut = (event: ClipboardEvent) => {
    this.clip();
    this.dispatch(Actions.cut);
  };

  handlePaste = (event: ClipboardEvent) => {
    this.dispatch(Actions.paste);
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
