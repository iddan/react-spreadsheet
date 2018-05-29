// @flow

import React, { PureComponent } from "react";
import type { ComponentType } from "react";
import devtools from "unistore/devtools";
import { connect } from "unistore/react";
import type { Store } from "unistore";
import { Parser as FormulaParser } from "hot-formula-parser";
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
    const { store } = this.props;
    const { data, selected } = store.getState();
    const matrix = PointSet.toMatrix(selected, data);
    const filteredMatrix = Matrix.filter(Boolean, matrix);
    const valueMatrix = Matrix.map(getValue, filteredMatrix);
    writeTextToClipboard(Matrix.join(valueMatrix));
  };

  componentDidMount() {
    const { copy, cut, paste } = this.props;
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
          {range(rows).map(rowNumber => (
            <Row key={rowNumber}>
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

export default connect(mapStateToProps, {
  copy: Actions.copy,
  cut: Actions.cut,
  paste: Actions.paste,
  onKeyDown: Actions.keyDown,
  onKeyPress: Actions.keyPress
})(Spreadsheet);
