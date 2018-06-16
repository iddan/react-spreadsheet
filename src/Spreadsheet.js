// @flow

import React, { PureComponent } from "react";
import type { ComponentType } from "react";
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
import { range, writeTextToClipboard } from "./util";
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
  Table: ComponentType<TableProps>,
  Row: ComponentType<RowProps>,
  Cell: ComponentType<CellProps<CellType, Value>>,
  DataViewer: Types.DataViewer<CellType, Value>,
  DataEditor: Types.DataEditor<CellType, Value>,
  getValue: Types.getValue<CellType, Value>,
  onKeyDown: (SyntheticKeyboardEvent<HTMLElement>) => void,
  onKeyPress: (SyntheticKeyboardEvent<HTMLElement>) => void,
  store: Store
|};

type State = {|
  rows: number,
  columns: number
|};

const ColumnIndicator = ({ column }) => <th>{columnIndexToLabel(column)}</th>;
const RowIndicator = ({ row }) => <th>{row + 1}</th>;

class Spreadsheet<CellType, Value> extends PureComponent<{|
  ...$Diff<
    Props<CellType, Value>,
    {|
      data: Matrix.Matrix<CellType>
    |}
  >,
  ...State
|}> {
  static defaultProps = {
    Table,
    Row,
    /** @todo enhance incoming Cell prop */
    Cell: enhanceCell(Cell),
    DataViewer,
    DataEditor,
    getValue
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
    return this.root === activeElement || this.root.contains(activeElement);
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

  root: HTMLDivElement;

  handleRoot = (root: HTMLDivElement) => {
    this.root = root;
  };

  render() {
    const {
      Table,
      Row,
      Cell,
      DataViewer,
      getValue,
      rows,
      columns,
      onKeyPress
    } = this.props;
    return (
      <div
        ref={this.handleRoot}
        className="Spreadsheet"
        onKeyPress={onKeyPress}
        onKeyDown={this.handleKeyDown}
      >
        <Table>
          <tr>
            <th />
            {range(columns).map(columnNumber => (
              <ColumnIndicator key={columnNumber} column={columnNumber} />
            ))}
          </tr>
          {range(rows).map(rowNumber => (
            <Row key={rowNumber}>
              <RowIndicator key={rowNumber} row={rowNumber} />
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
        <ActiveCell DataEditor={DataEditor} getValue={getValue} />
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
    onKeyPress: Actions.keyPress
  }
)(Spreadsheet);
