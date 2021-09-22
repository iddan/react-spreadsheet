import * as React from "react";
import classNames from "classnames";
import * as Types from "./types";
import * as PointRange from "./point-range";
import * as Actions from "./actions";
import * as PointMap from "./point-map";
import * as Matrix from "./matrix";
import * as Point from "./point";
import { Parser as FormulaParser } from "hot-formula-parser";

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
  getSelectedCSV,
  calculateSpreadsheetSize,
  transformCoordToPoint,
  getCellRangeValue,
  getCellValue,
  shouldHandleClipboardEvent,
} from "./util";
import reducer, { INITIAL_STATE, hasKeyDownHandler } from "./reducer";
import context from "./context";
import "./Spreadsheet.css";

/** The Spreadsheet component props */
export type Props<CellType extends Types.CellBase> = {
  /** The spreadsheet's data */
  data: Matrix.Matrix<CellType>;
  /** Class to be added to the spreadsheet element */
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
  /** Callback called when the Spreadsheet's data changes. */
  onChange?: (data: Matrix.Matrix<CellType>) => void;
  /** Callback called when the Spreadsheet's edit mode changes. */
  onModeChange?: (mode: Types.Mode) => void;
  /** Callback called when the Spreadsheet's selection changes. */
  onSelect?: (selected: Point.Point[]) => void;
  /** Callback called when Spreadsheet's active cell changes. */
  onActivate?: (active: Point.Point) => void;
  onCellCommit?: (
    prevCell: null | CellType,
    nextCell: null | CellType,
    coords: null | Point.Point
  ) => void;
};

/**
 * The Spreadsheet component
 */
const Spreadsheet = <CellType extends Types.CellBase>(
  props: Props<CellType>
): React.ReactElement => {
  const {
    className,
    columnLabels,
    rowLabels,
    hideColumnIndicators,
    hideRowIndicators,
    onKeyDown,
    Table = DefaultTable,
    Row = DefaultRow,
    CornerIndicator = DefaultCornerIndicator,
    DataEditor = DefaultDataEditor,
    DataViewer = DefaultDataViewer,
    getBindingsForCell = defaultGetBindingsForCell,
    RowIndicator = DefaultRowIndicator,
    ColumnIndicator = DefaultColumnIndicator,
    onChange = () => {},
    onModeChange = () => {},
    onSelect = () => {},
    onActivate = () => {},
    onCellCommit = () => {},
  } = props;
  const initialState = React.useMemo(
    () =>
      ({
        ...INITIAL_STATE,
        data: props.data,
      } as Types.StoreState<CellType>),
    [props.data]
  );
  const reducerElements = React.useReducer(
    reducer as unknown as React.Reducer<Types.StoreState<CellType>, any>,
    initialState
  );
  const [state, dispatch] = reducerElements;

  const size = React.useMemo(() => {
    return calculateSpreadsheetSize(state.data, rowLabels, columnLabels);
  }, [state.data, rowLabels, columnLabels]);

  const mode = state.mode;

  const rootRef = React.useRef<HTMLDivElement>(null);
  const prevStateRef = React.useRef<Types.StoreState<CellType>>({
    ...INITIAL_STATE,
    data: props.data,
    selected: null,
    copied: PointMap.from([]),
    bindings: PointMap.from([]),
    lastCommit: null,
  });

  const copy = React.useCallback(() => dispatch(Actions.copy()), [dispatch]);
  const cut = React.useCallback(() => dispatch(Actions.cut()), [dispatch]);
  const paste = React.useCallback(
    (data) => dispatch(Actions.paste(data)),
    [dispatch]
  );
  const onKeyDownAction = React.useCallback(
    (event) => dispatch(Actions.keyDown(event)),
    [dispatch]
  );
  const onKeyPress = React.useCallback(
    (event) => dispatch(Actions.keyPress(event)),
    [dispatch]
  );
  const onDragStart = React.useCallback(
    () => dispatch(Actions.dragStart()),
    [dispatch]
  );
  const onDragEnd = React.useCallback(
    () => dispatch(Actions.dragEnd()),
    [dispatch]
  );
  const setData = React.useCallback(
    (data) => dispatch(Actions.setData(data)),
    [dispatch]
  );

  React.useEffect(() => {
    const prevState = prevStateRef.current;
    if (state.lastCommit && state.lastCommit !== prevState.lastCommit) {
      for (const change of state.lastCommit) {
        onCellCommit(change.prevCell, change.nextCell, state.active);
      }
    }

    if (state.data !== prevState.data) {
      // Call on change only if the data change internal
      if (state.data !== props.data) {
        onChange(state.data);
      }
    }

    if (state.mode !== prevState.mode) {
      onModeChange(state.mode);
    }

    if (state.selected !== prevState.selected) {
      const points = state.selected
        ? Array.from(PointRange.iterate(state.selected))
        : [];
      onSelect(points);
    }

    if (state.active !== prevState.active && state.active) {
      onActivate(state.active);
    }

    prevStateRef.current = state;
  }, [
    props.data,
    state,
    onActivate,
    onCellCommit,
    onChange,
    onModeChange,
    onSelect,
    rowLabels,
    columnLabels,
  ]);

  React.useEffect(() => {
    const prevState = prevStateRef.current;
    if (props.data !== prevState.data) {
      setData(props.data);
    }
  }, [props.data, setData]);

  const clip = React.useCallback(
    (event: ClipboardEvent): void => {
      const { data, selected } = state;
      const csv = getSelectedCSV(selected, data);
      writeTextToClipboard(event, csv);
    },
    [state]
  );

  const handleCut = React.useCallback(
    (event: ClipboardEvent) => {
      if (shouldHandleClipboardEvent(rootRef.current, mode)) {
        event.preventDefault();
        event.stopPropagation();
        clip(event);
        cut();
      }
    },
    [mode, clip, cut]
  );

  const handleCopy = React.useCallback(
    (event: ClipboardEvent) => {
      if (shouldHandleClipboardEvent(rootRef.current, mode)) {
        event.preventDefault();
        event.stopPropagation();
        clip(event);
        copy();
      }
    },
    [mode, clip, copy]
  );

  const handlePaste = React.useCallback(
    (event: ClipboardEvent) => {
      if (shouldHandleClipboardEvent(rootRef.current, mode)) {
        event.preventDefault();
        event.stopPropagation();
        if (event.clipboardData) {
          const text = readTextFromClipboard(event);
          paste(text);
        }
      }
    },
    [mode, paste]
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (onKeyDown) {
        onKeyDown(event);
      }
      // Do not use event in case preventDefault() was called inside onKeyDown
      if (!event.defaultPrevented) {
        // Only disable default behavior if an handler exist
        if (hasKeyDownHandler(state, event)) {
          event.nativeEvent.preventDefault();
        }
        onKeyDownAction(event);
      }
    },
    [state, onKeyDown, onKeyDownAction]
  );

  const handleMouseUp = React.useCallback(() => {
    onDragEnd();
    document.removeEventListener("mouseup", handleMouseUp);
  }, [onDragEnd]);

  const handleMouseMove = React.useCallback(
    (event: React.MouseEvent) => {
      if (!state.dragging && event.buttons === 1) {
        onDragStart();
        document.addEventListener("mouseup", handleMouseUp);
      }
    },
    [state, onDragStart, handleMouseUp]
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
        const point = transformCoordToPoint(cellCoord);
        const data = state.data;
        value = getCellValue(formulaParser, data, point);
      } catch (error) {
        console.error(error);
      } finally {
        done(value);
      }
    });
    formulaParser.on("callRangeValue", (startCellCoord, endCellCoord, done) => {
      const startPoint = transformCoordToPoint(startCellCoord);
      const endPoint = transformCoordToPoint(endCellCoord);
      const data = state.data;
      let values;
      try {
        values = getCellRangeValue(formulaParser, data, startPoint, endPoint);
      } catch (error) {
        console.error(error);
      } finally {
        done(values);
      }
    });
  }, [formulaParser, state, handleCut, handleCopy, handlePaste]);

  const tableNode = React.useMemo(
    () => (
      <Table columns={size.columns} hideColumnIndicators={hideColumnIndicators}>
        <Row>
          {!hideRowIndicators && !hideColumnIndicators && <CornerIndicator />}
          {!hideColumnIndicators &&
            range(size.columns).map((columnNumber) =>
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
        {range(size.rows).map((rowNumber) => (
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
            {range(size.columns).map((columnNumber) => (
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
    ),
    [
      Table,
      size.rows,
      size.columns,
      hideColumnIndicators,
      Row,
      hideRowIndicators,
      CornerIndicator,
      columnLabels,
      ColumnIndicator,
      rowLabels,
      RowIndicator,
      Cell,
      DataViewer,
      formulaParser,
    ]
  );

  const activeCellNode = React.useMemo(
    () => (
      <ActiveCell
        // @ts-ignore
        DataEditor={DataEditor}
        // @ts-ignore
        getBindingsForCell={getBindingsForCell}
      />
    ),
    [DataEditor, getBindingsForCell]
  );

  const rootNode = React.useMemo(
    () => (
      <div
        ref={rootRef}
        className={classNames("Spreadsheet", className)}
        onKeyPress={onKeyPress}
        onKeyDown={handleKeyDown}
        onMouseMove={handleMouseMove}
      >
        {tableNode}
        {activeCellNode}
        <Selected />
        <Copied />
      </div>
    ),
    [
      className,
      onKeyPress,
      handleKeyDown,
      handleMouseMove,
      tableNode,
      activeCellNode,
    ]
  );

  return (
    <context.Provider value={reducerElements}>{rootNode}</context.Provider>
  );
};

export default Spreadsheet;
