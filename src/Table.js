// @flow
import React, { PureComponent } from "react";
import type { ComponentType } from "react";
import type { Props as RowProps } from "./Row";
import type { Props as CellProps } from "./Cell";
import * as Types from "./types";
import { getCellFromPath } from "./util";

export type Props<CellType, Value> = {
  rows: number,
  columns: number,
  onActiveChange: (
    | ?$Shape<Types.Active<Value>>
    | ((?Types.Active<Value>) => ?Types.Active<Value>)
  ) => void,
  Row: ComponentType<RowProps<CellType, Value>>,
  Cell: ComponentType<CellProps<CellType, Value>>,
  DataViewer: Types.DataViewer<CellType, Value>,
  DataEditor: Types.DataEditor<CellType, Value>,
  getValue: Types.getValue<CellType, Value>,
  onChange: Types.onChange<Value>,
  emptyValue: Value
};

type KeyDownHandlers<Value> = {
  [eventType: string]: (
    active: Types.Active<Value>,
    cell: $Call<getCellFromPath>
  ) => $Shape<Types.Active<Value>>
};

export default class Table<CellType, Value> extends PureComponent<
  Props<CellType, Value>
> {
  root: ?HTMLTableElement;

  handleRoot = (root: ?HTMLTableElement) => {
    this.root = root;
  };

  /**
   * Set active
   */
  handleClick = (e: SyntheticEvent<*>) => {
    const cell = getCellFromPath(e.nativeEvent);
    if (cell) {
      const { column, row } = cell;
      this.props.onActiveChange({ column, row, mode: "view" });
    }
  };

  /**
   * Set active and edit
   */
  handleDoubleClick = (e: SyntheticEvent<*>) => {
    const cell = getCellFromPath(e.nativeEvent);
    if (cell) {
      const { column, row } = cell;
      this.props.onActiveChange({ column, row, mode: "edit" });
    }
  };

  /**
   * Start edit by keyboard
   */
  handleKeyPress = (e: SyntheticEvent<*>) => {
    const cell = getCellFromPath(e.nativeEvent);
    const { key } = e;
    if (cell) {
      this.props.onActiveChange(active => {
        if (active.mode === "edit") {
          return active;
        }
        return {
          mode: "edit",
          value: key
        };
      });
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
    const cell = getCellFromPath(nativeEvent);
    if (cell) {
      this.props.onActiveChange(active => {
        if (!active) {
          return active;
        }
        const handlers =
          active.mode === "edit"
            ? this.editKeyDownHandlers
            : this.keyDownHandlers;
        const handler = handlers[key];
        if (handler) {
          nativeEvent.preventDefault();
          return handler(active);
        }
        return active;
      });
    }
  };

  focusActiveElement(active: Types.Active<Value>) {
    if (!this.root) {
      return;
    }
    const element = this.root.querySelector(
      `td[data-row="${active.row}"][data-column="${active.column}"]`
    );
    if (active.mode === "view" && element !== null) {
      element.focus();
    }
  }

  render() {
    const {
      rows,
      columns,
      Row,
      Cell,
      DataViewer,
      DataEditor,
      getValue,
      onChange
    } = this.props;
    return (
      <table
        className="SpreadsheetTable"
        ref={this.handleRoot}
        onClick={this.handleClick}
        onDoubleClick={this.handleDoubleClick}
        onKeyPress={this.handleKeyPress}
        onKeyDown={this.handleKeyDown}
      >
        <tbody>
          {Array(rows)
            .fill(1)
            .map((_, i) => (
              <Row
                {...{ Cell, DataViewer, DataEditor, getValue, onChange }}
                key={i}
                columns={columns}
                index={i}
              />
            ))}
        </tbody>
      </table>
    );
  }
}
