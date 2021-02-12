import * as React from "react";
import { connect } from "unistore/react";
import { Store } from "unistore";
import { Parser as FormulaParser } from "hot-formula-parser";

import * as Types from "./types";
import DefaultTable, { Props as TableProps } from "./Table";
import DefaultRow, { Props as RowProps } from "./Row";
import DefaultCornerIndicator, {
  Props as CornerIndicatorProps,
} from "./CornerIndicator";
import DefaultColumnIndicator, {
  Props as ColumnIndicatorProps,
} from "./ColumnIndicator";
import DefaultRowIndicator, {
  Props as RowIndicatorProps,
} from "./RowIndicator";
import { Cell as DefaultCell, enhance as enhanceCell } from "./Cell";
import DefaultDataViewer from "./DataViewer";
import DefaultDataEditor from "./DataEditor";
import ActiveCell from "./ActiveCell";
import Selected from "./Selected";
import Copied from "./Copied";
import { getBindingsForCell as defaultGetBindingsForCell } from "./bindings";
import {
  memoizeOne,
  range,
  readTextFromClipboard,
  writeTextToClipboard,
  getComputedValue,
} from "./util";
import * as PointSet from "./point-set";
import * as Matrix from "./matrix";
import * as Actions from "./actions";
import "./Spreadsheet.css";

export type Props<CellType extends Types.CellBase> = {
  formulaParser?: FormulaParser;
  columnLabels?: string[];
  rowLabels?: string[];
  hideRowIndicators?: boolean;
  hideColumnIndicators?: boolean;
  // Custom Components
  ColumnIndicator?: React.ComponentType<ColumnIndicatorProps>;
  CornerIndicator?: React.ComponentType<CornerIndicatorProps>;
  RowIndicator?: React.ComponentType<RowIndicatorProps>;
  Table?: React.ComponentType<TableProps>;
  Row?: React.ComponentType<RowProps>;
  Cell?: Types.CellComponent<CellType>;
  DataViewer?: Types.DataViewerComponent<CellType>;
  DataEditor?: Types.DataEditorComponent<CellType>;
  // Handlers
  onKeyDown?: (event: React.KeyboardEvent) => void;
  getBindingsForCell?: Types.getBindingsForCell<CellType>;
  // Internal store
  store: Store<Types.StoreState<CellType>>;
};

type Handlers = {
  cut: () => void;
  copy: () => void;
  paste: (text: string) => void;
  setDragging: (arg0: boolean) => void;
  onKeyDownAction: (syntheticKeyboardEvent: React.KeyboardEvent) => void;
  onKeyPress: (syntheticKeyboardEvent: React.KeyboardEvent) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
};

type State = {
  rows: number;
  columns: number;
  mode: Types.Mode;
};

class Spreadsheet<CellType extends Types.CellBase> extends React.PureComponent<
  Props<CellType> & State & Handlers
> {
  formulaParser = this.props.formulaParser || new FormulaParser();

  clip = (event: ClipboardEvent) => {
    const { store } = this.props;
    const { data, selected } = store.getState();
    const startPoint = PointSet.min(selected);
    const endPoint = PointSet.max(selected);
    const slicedMatrix = Matrix.slice(startPoint, endPoint, data);
    const valueMatrix = Matrix.map(
      (cell): string => (cell && cell.value) || "",
      slicedMatrix
    );
    const csv = Matrix.join(valueMatrix);
    writeTextToClipboard(event, csv);
  };

  isFocused(): boolean {
    const { activeElement } = document;

    return this.props.mode === "view" && this.root
      ? this.root === activeElement || this.root.contains(activeElement)
      : false;
  }

  handleCopy = (event: ClipboardEvent) => {
    if (this.isFocused()) {
      event.preventDefault();
      event.stopPropagation();
      this.clip(event);
      this.props.copy();
    }
  };

  handlePaste = async (event: ClipboardEvent) => {
    if (this.props.mode === "view" && this.isFocused()) {
      event.preventDefault();
      event.stopPropagation();
      if (event.clipboardData) {
        const text = readTextFromClipboard(event);
        this.props.paste(text);
      }
    }
  };

  handleCut = (event: ClipboardEvent) => {
    if (this.isFocused()) {
      event.preventDefault();
      event.stopPropagation();
      this.clip(event);
      this.props.cut();
    }
  };

  componentWillUnmount() {
    document.removeEventListener("cut", this.handleCut);
    document.removeEventListener("copy", this.handleCopy);
    document.removeEventListener("paste", this.handlePaste);
  }

  componentDidMount() {
    const { store } = this.props;
    document.addEventListener("cut", this.handleCut);
    document.addEventListener("copy", this.handleCopy);
    document.addEventListener("paste", this.handlePaste);
    this.formulaParser.on("callCellValue", (cellCoord, done) => {
      let value;
      /** @todo More sound error, or at least document */
      try {
        const cell = Matrix.get(
          cellCoord.row.index,
          cellCoord.column.index,
          store.getState().data
        );
        value = getComputedValue<CellType, CellType["value"]>({
          cell,
          formulaParser: this.formulaParser,
        });
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
          column: startCellCoord.column.index,
        };
        const endPoint = {
          row: endCellCoord.row.index,
          column: endCellCoord.column.index,
        };
        const values = Matrix.toArray(
          Matrix.slice(startPoint, endPoint, store.getState().data),
          (cell) =>
            getComputedValue<CellType, CellType["value"]>({
              cell,
              formulaParser: this.formulaParser,
            })
        );

        done(values);
      }
    );
  }

  handleKeyDown = (event: React.KeyboardEvent) => {
    const { store, onKeyDown, onKeyDownAction } = this.props;
    if (onKeyDown) {
      onKeyDown(event);
    }
    // Do not use event in case preventDefault() was called inside onKeyDown
    if (!event.defaultPrevented) {
      // Only disable default behavior if an handler exist
      if (Actions.getKeyDownHandler(store.getState(), event)) {
        event.nativeEvent.preventDefault();
      }
      onKeyDownAction(event);
    }
  };

  handleMouseUp = () => {
    this.props.onDragEnd();
    document.removeEventListener("mouseup", this.handleMouseUp);
  };

  handleMouseMove = (event: React.MouseEvent) => {
    if (!this.props.store.getState().dragging && event.buttons === 1) {
      this.props.onDragStart();
      document.addEventListener("mouseup", this.handleMouseUp);
    }
  };

  root: HTMLDivElement | null = null;

  handleRoot = (root: HTMLDivElement | null) => {
    this.root = root;
  };

  /**
   * The component inside the Cell prop is automatically enhanced with the enhance()
   * function inside Cell.js. This method is a small wrapper which memoizes the application
   * of enhance() to the user-provided Cell prop, in order to avoid creating new component
   * types on every re-render.
   */
  getCellComponent = memoizeOne(enhanceCell);

  render() {
    const {
      columnLabels,
      rowLabels,
      rows,
      columns,
      onKeyPress,
      hideColumnIndicators,
      hideRowIndicators,
      Table = DefaultTable,
      Row = DefaultRow,
      CornerIndicator = DefaultCornerIndicator,
      DataEditor = DefaultDataEditor,
      DataViewer = DefaultDataViewer,
      getBindingsForCell = defaultGetBindingsForCell,
      RowIndicator = DefaultRowIndicator,
      ColumnIndicator = DefaultColumnIndicator,
    } = this.props;

    // @ts-ignore
    const Cell = this.getCellComponent(this.props.Cell || DefaultCell);

    return (
      <div
        ref={this.handleRoot}
        className="Spreadsheet"
        onKeyPress={onKeyPress}
        onKeyDown={this.handleKeyDown}
        onMouseMove={this.handleMouseMove}
      >
        <Table columns={columns} hideColumnIndicators={hideColumnIndicators}>
          <Row>
            {!hideRowIndicators && !hideColumnIndicators && <CornerIndicator />}
            {!hideColumnIndicators &&
              range(columns).map((columnNumber) =>
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
          </Row>
          {range(rows).map((rowNumber) => (
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
              {range(columns).map((columnNumber) => (
                <Cell
                  key={columnNumber}
                  row={rowNumber}
                  column={columnNumber}
                  // @ts-ignore
                  DataViewer={DataViewer}
                  formulaParser={this.formulaParser}
                />
              ))}
            </Row>
          ))}
        </Table>
        <ActiveCell
          // @ts-ignore
          DataEditor={DataEditor}
          getBindingsForCell={getBindingsForCell}
        />
        <Selected />
        <Copied />
      </div>
    );
  }
}

const mapStateToProps = <Cell extends Types.CellBase>(
  { data, mode }: Types.StoreState<Cell>,
  { columnLabels }: Props<Cell>
): State => {
  const { columns, rows } = Matrix.getSize(data);
  return {
    mode,
    rows,
    columns: columnLabels ? Math.max(columns, columnLabels.length) : columns,
  };
};

export default connect(mapStateToProps, {
  copy: Actions.copy,
  cut: Actions.cut,
  paste: Actions.paste,
  onKeyDownAction: Actions.keyDown,
  onKeyPress: Actions.keyPress,
  onDragStart: Actions.dragStart,
  onDragEnd: Actions.dragEnd,
  // @ts-ignore
})(Spreadsheet);
