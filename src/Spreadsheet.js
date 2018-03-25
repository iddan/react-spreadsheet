/* @flow */
import React, { PureComponent } from "react";
import type { ComponentType } from "react";
import mitt from "mitt";
import Table from "./Table";
import type { Props as TableProps } from "./Table";
import Row from "./Row";
import type { Props as RowProps } from "./Row";
import Cell from "./Cell";
import type { Props as CellProps } from "./Cell";
import DataViewer from "./DataViewer";
import DataEditor from "./DataEditor";
import * as Types from "./types";
import { CELL_MODE_CHANGE, CELL_VALUE_CHANGE, CELL_SELECT } from "./Store";
import "./Spreadsheet.css";

export type Props<CellType, Value> = {
  data: CellType[][],
  onCellChange: Types.onChange<Value>,
  onActiveChange: (?Types.Active) => void,
  Table: ComponentType<TableProps<CellType, Value>>,
  Row: ComponentType<RowProps<CellType, Value>>,
  Cell: ComponentType<CellProps<CellType, Value>>,
  DataViewer: Types.DataViewer<CellType, Value>,
  DataEditor: Types.DataEditor<CellType, Value>,
  getValue: Types.getValue<CellType, Value>,
  emptyValue: Value
};

type State<Value> = {
  active: ?Types.Active<Value>
};

type KeyDownHandlers<Value> = {
  [eventType: string]: (
    active: Types.Active<Value>,
    cell: $Call<getCellFromPath>
  ) => $Shape<Types.Active<Value>>
};

/**
 * @todo
 * Selection: drag select
 * Clipboard: copy, paste, select copy, select paste
 * Support getValue() return boolean by default
 */
export default class Spreadsheet<CellType, Value> extends PureComponent<
  Props<CellType, Value>,
  State<Value>
> {
  static defaultProps = {
    Table,
    Row,
    Cell,
    DataViewer,
    DataEditor,
    getValue: ({ cell }: { cell: { value: string | number } | null }) =>
      cell && cell.value,
    emptyValue: ""
  };

  store = mitt();

  root: ?HTMLTableElement;
  selectedCell = null;

  componentDidMount() {
    const { store } = this;
    store.on(CELL_MODE_CHANGE, ({ mode }) => {
      this.selectedCell = { ...this.selectedCell, mode };
    });
    store.on(CELL_VALUE_CHANGE, ({ value }) => {
      this.selectedCell = { ...this.selectedCell, value };
    });
    store.on(CELL_SELECT, ({ row, column }) => {
      this.selectedCell = { ...this.selectedCell, row, column };
    });
  }

  /**
   * Start edit by keyboard
   */
  handleKeyPress = (e: SyntheticEvent<*>) => {
    const { store } = this;
    const { key } = e;
    if (this.selectedCell) {
      store.emit(CELL_VALUE_CHANGE, { ...this.selectedCell, value: key });
    }
  };

  keyDownHandlers: KeyDownHandlers<Value> = {
    ArrowUp: active => ({
      row: active.row - 1,
      column: active.column,
      mode: "view"
    }),
    ArrowDown: active => ({
      row: active.row + 1,
      column: active.column,
      mode: "view"
    }),
    ArrowLeft: active => ({
      row: active.row,
      column: active.column - 1,
      mode: "view"
    }),
    ArrowRight: active => ({
      row: active.row,
      column: active.column + 1,
      mode: "view"
    }),
    Tab: active => ({
      row: active.row,
      column: active.column + 1,
      mode: "view"
    }),
    Enter: active => ({
      mode: "edit"
    }),
    Backspace: active => {
      this.props.onChange({
        row: active.row,
        column: active.column,
        value: this.props.emptyValue
      });
      return { mode: "edit" };
    }
  };

  editKeyDownHandlers: KeyDownHandlers<Value> = {
    Escape: () => ({ mode: "view" }),
    Tab: active => ({
      row: active.row,
      column: active.column + 1,
      mode: "view"
    }),
    Enter: active => ({
      row: active.row + 1,
      column: active.column,
      mode: "view"
    })
  };

  /**
   * Keyboard navigation
   */
  handleKeyDown = (e: SyntheticEvent<*>) => {
    const { key, nativeEvent } = e;
    const handlers =
      this.selectedCell.mode === "edit"
        ? this.editKeyDownHandlers
        : this.keyDownHandlers;
    const handler = handlers[key];
    if (handler) {
      nativeEvent.preventDefault();
      return handler(this.selectedCell);
    }
  };

  render() {
    const {
      Table,
      Row,
      DataViewer,
      DataEditor,
      data,
      getValue,
      emptyValue
    } = this.props;
    const [firstRow] = data;
    const columns = firstRow ? firstRow.length : 0;
    const rows = data.length;
    return (
      <Table onKeyPress={this.handleKeyPress} onKeyDown={this.handleKeyDown}>
        {Array(rows)
          .fill(1)
          .map((_, row) => (
            <Row key={row} index={row}>
              {Array(columns)
                .fill(1)
                .map((_, column) => {
                  return (
                    <Cell
                      DataViewer={DataViewer}
                      DataEditor={DataEditor}
                      getValue={getValue}
                      key={column}
                      row={row}
                      column={column}
                      emptyValue={emptyValue}
                      value={data[row][column]}
                      store={this.store}
                    />
                  );
                })}
            </Row>
          ))}
      </Table>
    );
  }
}
