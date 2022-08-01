import * as React from "react";
import classNames from "classnames";
import * as Types from "./types";
import * as Actions from "./actions";
import * as PointMap from "./point-map";
import * as Matrix from "./matrix";
import * as Point from "./point";
import { Parser as FormulaParser } from "hot-formula-parser";

import DefaultTable from "./Table";
import DefaultRow from "./Row";
import DefaultHeaderRow from "./HeaderRow";
import DefaultCornerIndicator, {
  enhance as enhanceCornerIndicator,
} from "./CornerIndicator";
import DefaultColumnIndicator, {
  enhance as enhanceColumnIndicator,
} from "./ColumnIndicator";
import DefaultRowIndicator, {
  enhance as enhanceRowIndicator,
} from "./RowIndicator";
import { Cell as DefaultCell, enhance as enhanceCell } from "./Cell";
import DefaultDataViewer from "./DataViewer";
import DefaultDataEditor from "./DataEditor";
import ActiveCell from "./ActiveCell";
import Selected from "./Selected";
import Copied from "./Copied";
import { getBindingsForCell as defaultGetBindingsForCell } from "./bindings";
import * as Selection from "./selection";
import {
  range,
  readTextFromClipboard,
  writeTextToClipboard,
  calculateSpreadsheetSize,
  getCSV,
  transformCoordToPoint,
  getCellRangeValue,
  getCellValue,
  shouldHandleClipboardEvent,
  isFocusedWithin,
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
  /** Use dark colors that complenent dark mode */
  darkMode?: boolean;
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
  ColumnIndicator?: Types.ColumnIndicatorComponent;
  /** Component rendered in the corner of row and column indicators. */
  CornerIndicator?: Types.CornerIndicatorComponent;
  /** Component rendered next to each row. */
  RowIndicator?: Types.RowIndicatorComponent;
  /** The Spreadsheet's table component. */
  Table?: Types.TableComponent;
  /** The Spreadsheet's row component. */
  Row?: Types.RowComponent;
  /** The spreadsheet's header row component */
  HeaderRow?: Types.HeaderRowComponent;
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
  /** Callback called when the Spreadsheet loses focus */
  onBlur?: () => void;
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
    darkMode,
    columnLabels,
    rowLabels,
    hideColumnIndicators,
    hideRowIndicators,
    onKeyDown,
    Table = DefaultTable,
    Row = DefaultRow,
    HeaderRow = DefaultHeaderRow,
    DataEditor = DefaultDataEditor,
    DataViewer = DefaultDataViewer,
    getBindingsForCell = defaultGetBindingsForCell,
    onChange = () => {},
    onModeChange = () => {},
    onSelect = () => {},
    onActivate = () => {},
    onBlur = () => {},
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
  const blur = React.useCallback(() => dispatch(Actions.blur()), [dispatch]);

  React.useEffect(() => {
    const prevState = prevStateRef.current;
    if (state.lastCommit && state.lastCommit !== prevState.lastCommit) {
      for (const change of state.lastCommit) {
        onCellCommit(change.prevCell, change.nextCell, state.lastChanged);
      }
    }

    if (state.data !== prevState.data) {
      // Call on change only if the data change internal
      if (state.data !== props.data) {
        onChange(state.data);
      }
    }

    if (state.selected !== prevState.selected) {
      const points = Selection.getPoints(state.selected, state.data);
      onSelect(points);
    }

    if (state.mode !== prevState.mode) {
      onModeChange(state.mode);
    }

    if (state.active !== prevState.active) {
      if (state.active) {
        onActivate(state.active);
      } else {
        const root = rootRef.current;
        if (root && isFocusedWithin(root) && document.activeElement) {
          (document.activeElement as HTMLElement).blur();
        }
        onBlur();
      }
    }

    prevStateRef.current = state;
  }, [
    props.data,
    state,
    onActivate,
    onBlur,
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
      const selectedData = Selection.getSelectionFromMatrix(selected, data);
      const csv = getCSV(selectedData);
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
      event.persist();
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

  const handleBlur = React.useCallback(
    (event) => {
      /**
       * Focus left self, Not triggered when swapping focus between children
       * @see https://reactjs.org/docs/events.html#detecting-focus-entering-and-leaving
       */
      if (!event.currentTarget.contains(event.relatedTarget)) {
        blur();
      }
    },
    [blur]
  );

  const formulaParser = React.useMemo(() => {
    return props.formulaParser || new FormulaParser();
  }, [props.formulaParser]);

  const Cell = React.useMemo(() => {
    // @ts-ignore
    return enhanceCell(props.Cell || DefaultCell);
  }, [props.Cell]);

  const CornerIndicator = React.useMemo(
    () =>
      enhanceCornerIndicator(props.CornerIndicator || DefaultCornerIndicator),
    [props.CornerIndicator]
  );

  const RowIndicator = React.useMemo(
    () => enhanceRowIndicator(props.RowIndicator || DefaultRowIndicator),
    [props.RowIndicator]
  );

  const ColumnIndicator = React.useMemo(
    () =>
      enhanceColumnIndicator(props.ColumnIndicator || DefaultColumnIndicator),
    [props.ColumnIndicator]
  );

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
        <HeaderRow>
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
        </HeaderRow>
        {range(size.rows).map((rowNumber) => (
          <Row key={rowNumber} row={rowNumber}>
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
                // @ts-ignore
                getBindingsForCell={getBindingsForCell}
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
      HeaderRow,
      hideRowIndicators,
      CornerIndicator,
      columnLabels,
      ColumnIndicator,
      rowLabels,
      RowIndicator,
      Cell,
      DataViewer,
      formulaParser,
      getBindingsForCell,
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
        className={classNames("Spreadsheet", className, {
          "Spreadsheet--dark-mode": darkMode,
        })}
        onKeyPress={onKeyPress}
        onKeyDown={handleKeyDown}
        onMouseMove={handleMouseMove}
        onBlur={handleBlur}
      >
        {tableNode}
        {activeCellNode}
        <Selected />
        <Copied />
      </div>
    ),
    [
      className,
      darkMode,
      onKeyPress,
      handleKeyDown,
      handleMouseMove,
      handleBlur,
      tableNode,
      activeCellNode,
    ]
  );

  return (
    <context.Provider value={reducerElements}>{rootNode}</context.Provider>
  );
};

export default Spreadsheet;
