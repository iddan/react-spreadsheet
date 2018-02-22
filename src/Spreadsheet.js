/* @flow */
import React, { PureComponent } from "react";
import type { ComponentType } from "react";
import * as Contexts from "./contexts";
import Table from "./Table";
import type { Props as TableProps } from "./Table";
import Row from "./Row";
import type { Props as RowProps } from "./Row";
import Cell from "./Cell";
import type { Props as CellProps } from "./Cell";
import DataViewer from "./DataViewer";
import DataEditor from "./DataEditor";
import * as Types from "./types";
import { normalizeIndex } from "./util";
import "./Spreadsheet.css";

type Props<CellType, Value> = {
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

const ACTIVE_CELL_THROTTLE = 30;

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
    getValue: ({ cell }: { cell: { value: string | number } }) => cell.value,
    emptyValue: ""
  };

  root: ?HTMLDivElement;

  state = {
    active: null
  };

  normalizeActive(active: ?Types.Active<Value>) {
    if (!active) {
      return null;
    }
    const { data } = this.props;
    const [firstRow] = data;
    return {
      ...active,
      row: normalizeIndex(data, active.row),
      column: normalizeIndex(firstRow, active.column)
    };
  }

  /**
   * Like this.setState() but for this.state.active except when given
   * null or (prevState) => null sets state to { active: null } instead
   * of aborting. Instead expects returning previous active state
   */
  setActive = (
    arg1:
      | ?$Shape<Types.Active<Value>>
      | ((
          prevActive: Types.Active<Value> | null
        ) => $Shape<Types.Active<Value>> | null),
    callback
  ) => {
    this.setState(
      prevState => {
        switch (typeof arg1) {
          case "object": {
            if (arg1 === null) {
              return { active: null };
            }
            if (arg1 === prevState.active) {
              return null;
            }
            return {
              active: this.normalizeActive({ ...prevState.active, ...arg1 })
            };
          }
          case "function": {
            const nextActive = arg1(prevState.active);
            if (nextActive === null) {
              return { active: null };
            }
            if (nextActive === prevState.active) {
              return null;
            }
            return {
              active: this.normalizeActive({
                ...prevState.active,
                ...nextActive
              })
            };
          }
          default: {
            throw new Error(
              "this.setActive() must recieve active state object or function returning next active state"
            );
          }
        }
      },
      callback || this.props.onActiveChange
        ? () => {
            if (callback) {
              callback();
            }
            if (this.props.onActiveChange) {
              this.props.onActiveChange(this.state.active);
            }
          }
        : null
    );
  };

  table: Table<CellType, Value> | null = null;

  handleTable = (table: Table<CellType, Value> | null) => {
    this.table = table;
  };

  handleActiveCellTimeout: ?TimeoutID = null;

  focusActiveElement = () => {
    const { active } = this.state;
    if (this.table && active) {
      this.table.focusActiveElement(active);
    }
  };

  componentDidUpdate() {
    if (this.handleActiveCellTimeout) {
      clearTimeout(this.handleActiveCellTimeout);
    }
    this.handleActiveCellTimeout = setTimeout(
      this.focusActiveElement,
      ACTIVE_CELL_THROTTLE
    );
  }

  render() {
    const {
      Table,
      Row,
      DataViewer,
      DataEditor,
      data,
      getValue,
      onCellChange,
      emptyValue
    } = this.props;
    const [firstRow] = data;
    const { active } = this.state;
    return (
      <Contexts.Data.Provider value={data}>
        <Contexts.Active.Provider value={active}>
          <Table
            ref={this.handleTable}
            {...{
              Row,
              Cell,
              DataViewer,
              DataEditor,
              getValue,
              emptyValue
            }}
            rows={data.length}
            columns={firstRow && firstRow.length}
            onActiveChange={this.setActive}
            onChange={onCellChange}
          />
        </Contexts.Active.Provider>
      </Contexts.Data.Provider>
    );
  }
}
