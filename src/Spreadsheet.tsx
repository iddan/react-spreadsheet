import * as React from "react";
import { connect } from "unistore/react";
import { Store } from "unistore";
import { Parser as FormulaParser } from "hot-formula-parser";
import classNames from "classnames";

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
  range,
  readTextFromClipboard,
  writeTextToClipboard,
  getComputedValue,
  getSelectedCSV,
} from "./util";
import * as Matrix from "./matrix";
import * as Actions from "./actions";
import "./Spreadsheet.css";

export type Props<CellType extends Types.CellBase> = {
  className?: string;
  /**
   * Instance of `FormulaParser` to be used by the Spreadsheet.
   * Defaults to: internal instance created by the component.
   */
  formulaParser?: FormulaParser;
  /**
   * Labels to use in column indicators.
   * Defaults to: alphabetical labels.
   */
  columnLabels?: string[];
  /**
   * Labels to use in row indicators.
   * Defaults to: row index labels.
   */
  rowLabels?: string[];
  /**
   * If set to true, hides the row indicators of the spreadsheet.
   * Defaults to: `false`.
   */
  hideRowIndicators?: boolean;
  /**
   * If set to true, hides the column indicators of the spreadsheet.
   * Defaults to: `false`.
   */
  hideColumnIndicators?: boolean;
  // Custom Components
  /** Component rendered above each column. */
  ColumnIndicator?: React.ComponentType<ColumnIndicatorProps>;
  /** Component rendered in the corner of row and column indicators. */
  CornerIndicator?: React.ComponentType<CornerIndicatorProps>;
  /** Component rendered next to each row. */
  RowIndicator?: React.ComponentType<RowIndicatorProps>;
  /** The Spreadsheet's table component. */
  Table?: React.ComponentType<TableProps>;
  /** The Spreadsheet's row component. */
  Row?: React.ComponentType<RowProps>;
  /** The Spreadsheet's cell component. */
  Cell?: Types.CellComponent<CellType>;
  /** Component rendered for cells in view mode. */
  DataViewer?: Types.DataViewerComponent<CellType>;
  /** Component rendered for cells in edit mode. */
  DataEditor?: Types.DataEditorComponent<CellType>;
  // Handlers
  /** Callback called on key down inside the spreadsheet. */
  onKeyDown?: (event: React.KeyboardEvent) => void;
  /**
   * Calculate which cells should be updated when given cell updates.
   * Defaults to: internal implementation which infers dependencies according to formulas.
   */
  getBindingsForCell?: Types.GetBindingsForCell<CellType>;
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

const Spreadsheet = <CellType extends Types.CellBase>(
  props: Props<CellType> & State & Handlers
) => {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const {
    store,
    mode,
    className,
    columnLabels,
    rowLabels,
    rows,
    columns,
    hideColumnIndicators,
    hideRowIndicators,
    cut,
    copy,
    paste,
    onKeyDown,
    onKeyDownAction,
    onDragStart,
    onDragEnd,
    onKeyPress,
    Table = DefaultTable,
    Row = DefaultRow,
    CornerIndicator = DefaultCornerIndicator,
    DataEditor = DefaultDataEditor,
    DataViewer = DefaultDataViewer,
    getBindingsForCell = defaultGetBindingsForCell,
    RowIndicator = DefaultRowIndicator,
    ColumnIndicator = DefaultColumnIndicator,
  } = props;

  const clip = React.useCallback(
    (event: ClipboardEvent): void => {
      const { data, selected } = store.getState();
      const csv = getSelectedCSV(selected, data);
      writeTextToClipboard(event, csv);
    },
    [store]
  );

  const isFocused = React.useCallback(() => {
    const root = rootRef.current;
    const { activeElement } = document;

    return mode === "view" && root
      ? root === activeElement || root.contains(activeElement)
      : false;
  }, [rootRef, mode]);

  const handleCut = React.useCallback(
    (event: ClipboardEvent) => {
      if (isFocused()) {
        event.preventDefault();
        event.stopPropagation();
        clip(event);
        cut();
      }
    },
    [isFocused, clip, cut]
  );

  const handleCopy = React.useCallback(
    (event: ClipboardEvent) => {
      if (isFocused()) {
        event.preventDefault();
        event.stopPropagation();
        clip(event);
        copy();
      }
    },
    [isFocused, clip, copy]
  );

  const handlePaste = React.useCallback(
    async (event: ClipboardEvent) => {
      if (mode === "view" && isFocused()) {
        event.preventDefault();
        event.stopPropagation();
        if (event.clipboardData) {
          const text = readTextFromClipboard(event);
          paste(text);
        }
      }
    },
    [mode, isFocused, paste]
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
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
    },
    [store, onKeyDown, onKeyDownAction]
  );

  const handleMouseUp = React.useCallback(() => {
    onDragEnd();
    document.removeEventListener("mouseup", handleMouseUp);
  }, [onDragEnd]);

  const handleMouseMove = React.useCallback(
    (event: React.MouseEvent) => {
      if (!store.getState().dragging && event.buttons === 1) {
        onDragStart();
        document.addEventListener("mouseup", handleMouseUp);
      }
    },
    [store, onDragStart, handleMouseUp]
  );

  const formulaParser = React.useMemo(() => {
    return props.formulaParser || new FormulaParser();
  }, [props.formulaParser]);

  const Cell = React.useMemo(() => {
    // @ts-ignore
    return enhanceCell(props.Cell || DefaultCell);
  }, [props.Cell]);

  React.useEffect(() => {
    document.addEventListener("cut", handleCut);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
    };
  }, [handleCut, handleCopy, handlePaste]);

  React.useEffect(() => {
    formulaParser.on("callCellValue", (cellCoord, done) => {
      let value;
      try {
        const point = {
          row: cellCoord.row.index,
          column: cellCoord.column.index,
        };
        const cell = Matrix.get(point, store.getState().data);
        value = getComputedValue<CellType, CellType["value"]>({
          cell,
          formulaParser: formulaParser,
        });
      } catch (error) {
        console.error(error);
      } finally {
        done(value);
      }
    });
    formulaParser.on("callRangeValue", (startCellCoord, endCellCoord, done) => {
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
            formulaParser: formulaParser,
          })
      );

      done(values);
    });
  }, [formulaParser, store, handleCut, handleCopy, handlePaste]);

  return (
    <div
      ref={rootRef}
      className={classNames("Spreadsheet", className)}
      onKeyPress={onKeyPress}
      onKeyDown={handleKeyDown}
      onMouseMove={handleMouseMove}
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
                formulaParser={formulaParser}
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
};

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
