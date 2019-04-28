// @flow

import React, { PureComponent } from "react";
import type { ComponentType, Node } from "react";
import devtools from "unistore/devtools";
import { connect } from "unistore/react";
import type { Store } from "unistore";
import {
  Parser as FormulaParser,
  columnIndexToLabel
} from "hot-formula-parser";
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
import { getBindingsForCell } from "./bindings";
import { range, writeTextToClipboard, resolveFalsyValues } from "./util";
import * as PointSet from "./point-set";
import * as Matrix from "./matrix";
import * as Actions from "./actions";
import "./Spreadsheet.css";

type DefaultCellType = {
  value: string | number | boolean | null
};

const getValue = ({ data }: { data: ?DefaultCellType }) =>
  data ? data.value : null;

export type Props<CellType, Value> = {|
  data: Matrix.Matrix<CellType>,
  columnLabels?: string[],
  rowLabels?: string[],
  hideRowIndicators?: boolean,
  hideColumnIndicators?: boolean,
  Table: ComponentType<TableProps>,
  Row: ComponentType<RowProps>,
  Cell: ComponentType<CellProps<CellType, Value>>,
  DataViewer: Types.DataViewer<CellType, Value>,
  DataEditor: Types.DataEditor<CellType, Value>,
  getValue: Types.getValue<CellType, Value>,
  getBindingsForCell: Types.getBindingsForCell<CellType>,
  onCellCommit: Types.onCellCommit<CellType>,
  store: Store
|};

type Handlers = {|
  cut: () => void,
  copy: () => void,
  paste: () => void,
  setDragging: boolean => void,
  onKeyDown: (SyntheticKeyboardEvent<HTMLElement>) => void,
  onKeyPress: (SyntheticKeyboardEvent<HTMLElement>) => void,
  onDragStart: () => void,
  onDragEnd: () => void
|};

type State = {|
  rows: number,
  columns: number
|};

type ColumnIndicatorProps = {
  column: number,
  label?: Node | null
};

const ColumnIndicator = ({ column, label }: ColumnIndicatorProps) =>
  label !== undefined ? (
    <th>{label}</th>
  ) : (
    <th>{columnIndexToLabel(column)}</th>
  );

type RowIndicatorProps = {
  column: number,
  label?: Node | null
};

const RowIndicator = ({ row, label }: RowIndicatorProps) =>
  label !== undefined ? <th>{label}</th> : <th>{row + 1}</th>;

class Spreadsheet<CellType, Value> extends PureComponent<{|
  ...$Diff<
    Props<CellType, Value>,
    {|
      data: Matrix.Matrix<CellType>
    |}
  >,
  ...State,
  ...Handlers
|}> {
  static defaultProps = {
    Table,
    Row,
    /** @todo enhance incoming Cell prop */
    Cell: enhanceCell(Cell),
    DataViewer,
    DataEditor,
    getValue,
    getBindingsForCell
  };

  formulaParser = new FormulaParser();

  clip = () => {
    const { store, getValue } = this.props;
    const { data, selected } = store.getState();
    const startPoint = PointSet.min(selected);
    const endPoint = PointSet.max(selected);
    const slicedMatrix = Matrix.slice(startPoint, endPoint, data);
    const valueMatrix = Matrix.map((value, point) => {
      // Slice makes non-existing cells undefined, empty cells are classically
      // translated to an empty string in join()
      if (value === undefined) {
        return "";
      }
      return getValue({ ...point, data: value });
    }, slicedMatrix);
    writeTextToClipboard(Matrix.join(valueMatrix));
  };

  isFocused(): boolean {
    const { activeElement } = document;
    return this.root
      ? this.root === activeElement || this.root.contains(activeElement)
      : false;
  }

  componentDidMount() {
    const { copy, cut, paste, store } = this.props;
    document.addEventListener("copy", (event: ClipboardEvent) => {
      if (this.isFocused()) {
        event.preventDefault();
        event.stopPropagation();
        this.clip();
        copy();
      }
    });
    document.addEventListener("cut", (event: ClipboardEvent) => {
      if (this.isFocused()) {
        event.preventDefault();
        event.stopPropagation();
        this.clip();
        cut();
      }
    });
    document.addEventListener("paste", (event: ClipboardEvent) => {
      if (this.isFocused()) {
        event.preventDefault();
        event.stopPropagation();
        paste();
      }
    });
    this.formulaParser.on("callCellValue", (cellCoord, done) => {
      let value;
      /** @todo More sound error, or at least document */
      try {
        const cell = Matrix.get(
          cellCoord.row.index,
          cellCoord.column.index,
          store.getState().data
        );
        value = getValue({ data: cell });
      } catch (error) {
        console.error(error);
      } finally {
        done(value);
      }
    });
    this.formulaParser.on(
      "callRangeValue",
      (startCellCoord, endCellCoord, done) => {
        const startPoint = {
          row: startCellCoord.row.index,
          column: startCellCoord.column.index
        };
        const endPoint = {
          row: endCellCoord.row.index,
          column: endCellCoord.column.index
        };
        const values = Matrix.toArray(
          Matrix.slice(startPoint, endPoint, store.getState().data)
        ).map(cell => getValue({ data: cell }));
        done(values);
      }
    );
  }

  handleKeyDown = event => {
    const { store, onKeyDown } = this.props;
    // Only disable default behavior if an handler exist
    if (Actions.getKeyDownHandler(store.getState(), event)) {
      event.nativeEvent.preventDefault();
    }
    onKeyDown(event);
  };

  handleMouseUp = () => {
    this.props.onDragEnd();
    document.removeEventListener("mouseup", this.handleMouseUp);
  };

  handleMouseMove = event => {
    if (!this.props.store.getState().dragging && event.buttons === 1) {
      this.props.onDragStart();
      document.addEventListener("mouseup", this.handleMouseUp);
    }
  };

  root: HTMLDivElement | null;

  handleRoot = (root: HTMLDivElement | null) => {
    this.root = root;
  };

  render() {
    const {
      Table,
      Row,
      Cell,
      columnLabels,
      rowLabels,
      DataViewer,
      getValue,
      rows,
      columns,
      onKeyPress,
      onCellCommit,
      getBindingsForCell,
      hideColumnIndicators,
      hideRowIndicators
    } = this.props;
    return (
      <div
        ref={this.handleRoot}
        className="Spreadsheet"
        onKeyPress={onKeyPress}
        onKeyDown={this.handleKeyDown}
        onMouseMove={this.handleMouseMove}
      >
        <Table>
          <tr>
            {!hideRowIndicators && !hideColumnIndicators && <th />}
            {!hideColumnIndicators &&
              range(columns).map(columnNumber =>
                columnLabels ? (
                  <ColumnIndicator
                    key={columnNumber}
                    column={columnNumber}
                    label={
                      columnNumber in columnLabels
                        ? columnLabels[columnNumber]
                        : null
                    }
                  />
                ) : (
                  <ColumnIndicator key={columnNumber} column={columnNumber} />
                )
              )}
          </tr>
          {range(rows).map(rowNumber => (
            <Row key={rowNumber}>
              {!hideRowIndicators &&
                (rowLabels ? (
                  <RowIndicator
                    key={rowNumber}
                    row={rowNumber}
                    label={rowNumber in rowLabels ? rowLabels[rowNumber] : null}
                  />
                ) : (
                  <RowIndicator key={rowNumber} row={rowNumber} />
                ))}
              {range(columns).map(columnNumber => (
                <Cell
                  key={columnNumber}
                  row={rowNumber}
                  column={columnNumber}
                  DataViewer={DataViewer}
                  getValue={getValue}
                  formulaParser={this.formulaParser}
                />
              ))}
            </Row>
          ))}
        </Table>
        <ActiveCell
          onCellCommit={onCellCommit}
          DataEditor={DataEditor}
          getValue={getValue}
          getBindingsForCell={getBindingsForCell}
        />
        <Selected />
        <Copied />
      </div>
    );
  }
}

const mapStateToProps = ({ data }: Types.StoreState<*>): State =>
  Matrix.getSize(data);

export default connect(
  mapStateToProps,
  {
    copy: Actions.copy,
    cut: Actions.cut,
    paste: Actions.paste,
    onKeyDown: Actions.keyDown,
    onKeyPress: Actions.keyPress,
    onDragStart: Actions.dragStart,
    onDragEnd: Actions.dragEnd
  }
)(Spreadsheet);
