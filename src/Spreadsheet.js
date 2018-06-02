// @flow

import React, { PureComponent } from "react";
import type { ComponentType } from "react";
import { connect } from "unistore/react";
import type { Store } from "unistore";
import {
  Parser as FormulaParser,
  columnIndexToLabel,
  extractLabel
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

declare class ClipboardEvent extends Event {
  clipboardData: DataTransfer;
}

type DefaultCellType = {
  value: string | number | boolean | null
};

const getValue = ({ data }: { data: ?DefaultCellType }) =>
  data ? data.value : null;

const labelToPoint = (label: string): Types.Point => {
  const [row, column] = extractLabel(label);
  return { row: row.index, column: column.index };
};

/** @todo use external parser or extract */
const CELL_REFERENCES_REGEX = /(\$?[A-Z]+\$?[0-9]+(?::\$?[A-Z]+\$?[0-9]+)?)/g;
const getCellReferences = (formula: string): string[] =>
  formula.match(CELL_REFERENCES_REGEX) || [];

const getBindingsForCell: Types.getBindingsForCell<?DefaultCellType> = (
  cell,
  data
) => {
  if (
    cell.data &&
    typeof cell.data.value === "string" &&
    cell.data.value.startsWith("=")
  ) {
    const { rows, columns } = Matrix.getSize(data);
    return getCellReferences(cell.data.value).reduce((acc, match) => {
      if (match.includes(":")) {
        let [startPoint, endPoint] = match.split(":").map(labelToPoint);
        endPoint = {
          row: Math.min(endPoint.row, rows),
          column: Math.min(endPoint.column, columns)
        };
        return [...acc, ...Matrix.inclusiveRange(startPoint, endPoint)];
      }
      return [...acc, labelToPoint(match)];
    }, []);
  }
  return [];
};

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
  getBindingsForCell: Types.getBindingsForCell<CellType>,
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
    getValue,
    getBindingsForCell
  };

  getBindingsForCell = cellDescriptor => {
    const { getBindingsForCell, store } = this.props;
    return getBindingsForCell(cellDescriptor, store.getState().data);
  };

  formulaParser = new FormulaParser();

  clip = () => {
    const { store } = this.props;
    const { data, selected } = store.getState();
    const matrix = PointSet.toMatrix(selected, data);
    const filteredMatrix = Matrix.filter(Boolean, matrix);
    const valueMatrix = Matrix.map(getValue, filteredMatrix);
    writeTextToClipboard(Matrix.join(valueMatrix));
  };

  componentDidMount() {
    const { copy, cut, paste, store } = this.props;
    document.addEventListener("copy", (event: ClipboardEvent) => {
      event.preventDefault();
      event.stopPropagation();
      this.clip();
      copy();
    });
    document.addEventListener("cut", (event: ClipboardEvent) => {
      event.preventDefault();
      event.stopPropagation();
      this.clip();
      cut();
    });
    document.addEventListener("paste", (event: ClipboardEvent) => {
      event.preventDefault();
      event.stopPropagation();
      paste();
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
        const { rows, columns } = Matrix.getSize(
          this.props.store.getState().data
        );
        const startPoint = {
          row: startCellCoord.row.index,
          column: startCellCoord.column.index
        };
        const endPoint = {
          row: Math.min(rows, endCellCoord.row.index),
          column: Math.min(columns, endCellCoord.column.index)
        };
        let values = [];
        try {
          values = Matrix.toArray(
            Matrix.slice(startPoint, endPoint, store.getState().data),
            cell => getValue({ data: cell })
          );
        } catch (error) {
          console.error(error);
        } finally {
          done(values);
        }
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
        <ActiveCell
          DataEditor={DataEditor}
          getValue={getValue}
          getBindingsForCell={this.getBindingsForCell}
        />
        <Selected />
        <Copied />
      </div>
    );
  }
}

const mapStateToProps = ({ data }: Types.StoreState<*>): State =>
  Matrix.getSize(data);

export default connect(mapStateToProps, {
  copy: Actions.copy,
  cut: Actions.cut,
  paste: Actions.paste,
  onKeyDown: Actions.keyDown,
  onKeyPress: Actions.keyPress
})(Spreadsheet);
