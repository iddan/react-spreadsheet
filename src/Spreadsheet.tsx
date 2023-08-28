import * as React from "react";
import classNames from "classnames";
import * as Types from "./types";
import * as Actions from "./actions";
import * as Matrix from "./matrix";
import * as Point from "./point";

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
import {
  range,
  readTextFromClipboard,
  writeTextToClipboard,
  calculateSpreadsheetSize,
  getCSV,
  shouldHandleClipboardEvent,
  isFocusedWithin,
} from "./util";
import reducer, { INITIAL_STATE, hasKeyDownHandler } from "./reducer";
import context from "./context";
import "./Spreadsheet.css";
import { Model } from "./engine";
import FormulaParser from "fast-formula-parser";
import {CellBase} from "./types";

/** The Spreadsheet component props */
export type Props<CellType extends Types.CellBase> = {
  /** The spreadsheet's data */
  data: Matrix.Matrix<CellType>;
  /** Class to be added to the spreadsheet element */
  className?: string;
  /** Use dark colors that complement dark mode */
  darkMode?: boolean;
  /**
   * Constructor for the instance of `FormulaParser` to be used by the Spreadsheet.
   * Defaults to: internal instance created by the component.
   */
  parserConstructor?: (getData: () => Matrix.Matrix<CellBase>) => FormulaParser
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
    parserConstructor,
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
    onChange = () => {},
    onModeChange = () => {},
    onSelect = () => {},
    onActivate = () => {},
    onBlur = () => {},
    onCellCommit = () => {},
  } = props;
  const initialState = React.useMemo(() => {
    const model = new Model(props.data);
    return {
      ...INITIAL_STATE,
      model,
    } as Types.StoreState<CellType>;
  }, [props.data]);

  const reducerElements = React.useReducer(
    reducer as unknown as React.Reducer<Types.StoreState<CellType>, any>,
    initialState
  );
  const [state, dispatch] = reducerElements;

  const size = React.useMemo(() => {
    return calculateSpreadsheetSize(state.model.data, rowLabels, columnLabels);
  }, [state.model.data, rowLabels, columnLabels]);

  const mode = state.mode;

  const rootRef = React.useRef<HTMLDivElement>(null);
  const prevStateRef = React.useRef<Types.StoreState<CellType>>(initialState);

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

    if (state.model.data !== prevState.model.data) {
      // Call on change only if the data change internal
      if (state.model.data !== props.data) {
        onChange(state.model.data);
      }
    }

    if (state.selected !== prevState.selected) {
      const selectedRange = state.selected.toRange(state.model.data);
      const selectedPoints = Array.from(selectedRange || []);
      onSelect(selectedPoints);
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
    if (props.data !== prevState.model.data) {
      setData(props.data);
    }
  }, [props.data, setData]);

  const writeDataToClipboard = React.useCallback(
    (event: ClipboardEvent): void => {
      const { model, selected } = state;
      const { data } = model;
      const range = selected.toRange(data);
      if (range) {
        const selectedData = Matrix.slice(range.start, range.end, data);
        const csv = getCSV(selectedData);
        writeTextToClipboard(event, csv);
      }
    },
    [state]
  );

  const handleCut = React.useCallback(
    (event: ClipboardEvent) => {
      if (shouldHandleClipboardEvent(rootRef.current, mode)) {
        event.preventDefault();
        event.stopPropagation();
        writeDataToClipboard(event);
        cut();
      }
    },
    [mode, writeDataToClipboard, cut]
  );

  const handleCopy = React.useCallback(
    (event: ClipboardEvent) => {
      if (shouldHandleClipboardEvent(rootRef.current, mode)) {
        event.preventDefault();
        event.stopPropagation();
        writeDataToClipboard(event);
        copy();
      }
    },
    [mode, writeDataToClipboard, copy]
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
                parserConstructor={parserConstructor}
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
      parserConstructor
    ]
  );

  const activeCellNode = React.useMemo(
    () => (
      <ActiveCell
        // @ts-ignore
        DataEditor={DataEditor}
        parserConstructor={parserConstructor}
      />
    ),
    [DataEditor]
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
