import * as React from "react";

import createStore from "unistore";
import devtools from "unistore/devtools";
import { Provider } from "unistore/react";
import * as Types from "./types";
import * as PointRange from "./point-range";
import * as Actions from "./actions";
import * as PointMap from "./point-map";
import * as Matrix from "./matrix";
import * as Point from "./point";
import { Parser as FormulaParser } from "hot-formula-parser";
import classNames from "classnames";

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

const INITIAL_STATE: Pick<
  Types.StoreState,
  | "active"
  | "mode"
  | "rowDimensions"
  | "columnDimensions"
  | "lastChanged"
  | "hasPasted"
  | "cut"
  | "dragging"
> = {
  active: null,
  mode: "view",
  rowDimensions: {},
  columnDimensions: {},
  lastChanged: null,
  hasPasted: false,
  cut: false,
  dragging: false,
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

  // The size of data, synced with store state
  const [size, setSize] = React.useState(
    calculateSpreadsheetSize(props.data, rowLabels, columnLabels)
  );
  // The spreadsheet mode, synced with store state
  const [mode, setMode] = React.useState(INITIAL_STATE.mode);

  const rootRef = React.useRef<HTMLDivElement>(null);
  const prevStateRef = React.useRef<Types.StoreState<CellType>>({
    ...INITIAL_STATE,
    data: props.data,
    selected: null,
    copied: PointMap.from([]),
    bindings: PointMap.from([]),
    lastCommit: null,
  });

  const store = React.useMemo(() => {
    const prevState = prevStateRef.current;
    return process.env.NODE_ENV === "production"
      ? createStore(prevState)
      : devtools(createStore(prevState));
  }, []);

  const copy = React.useMemo(() => store.action(Actions.copy), [store]);
  const cut = React.useMemo(() => store.action(Actions.cut), [store]);
  const paste = React.useMemo(() => store.action(Actions.paste), [store]);
  const onKeyDownAction = React.useMemo(
    () => store.action(Actions.keyDown),
    [store]
  );
  const onKeyPress = React.useMemo(
    () => store.action(Actions.keyPress),
    [store]
  );
  const onDragStart = React.useMemo(
    () => store.action(Actions.dragStart),
    [store]
  );
  const onDragEnd = React.useMemo(() => store.action(Actions.dragEnd), [store]);
  const setData = React.useMemo(() => store.action(Actions.setData), [store]);

  const handleStoreChange = React.useCallback(
    (state: Types.StoreState<CellType>) => {
      const prevState = prevStateRef.current;

      if (state.lastCommit && state.lastCommit !== prevState.lastCommit) {
        for (const change of state.lastCommit) {
          onCellCommit(change.prevCell, change.nextCell, state.active);
        }
      }

      if (state.data !== prevState.data) {
        // Sync local size state with store state
        const nextSize = calculateSpreadsheetSize(
          state.data,
          rowLabels,
          columnLabels
        );
        setSize((prevSize) =>
          prevSize.columns === nextSize.columns &&
          prevSize.rows === nextSize.rows
            ? prevSize
            : nextSize
        );

        // Call on change only if the data change internal
        if (state.data !== props.data) {
          onChange(state.data);
        }
      }

      if (state.mode !== prevState.mode) {
        onModeChange(state.mode);
        // Sync local mode state with store state
        setMode(state.mode);
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
    },
    [
      onActivate,
      onCellCommit,
      onChange,
      onModeChange,
      onSelect,
      rowLabels,
      columnLabels,
      props.data,
    ]
  );

  React.useEffect(() => {
    const unsubscribe = store.subscribe(handleStoreChange);
    return unsubscribe;
  }, [store, handleStoreChange]);

  React.useEffect(() => {
    const prevState = prevStateRef.current;
    if (props.data !== prevState.data) {
      setData(props.data);
    }
  }, [props.data, setData]);

  const clip = React.useCallback(
    (event: ClipboardEvent): void => {
      const { data, selected } = store.getState();
      const csv = getSelectedCSV(selected, data);
      writeTextToClipboard(event, csv);
    },
    [store]
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
        const point = transformCoordToPoint(cellCoord);
        const data = store.getState().data;
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
      const data = store.getState().data;
      let values;
      try {
        values = getCellRangeValue(formulaParser, data, startPoint, endPoint);
      } catch (error) {
        console.error(error);
      } finally {
        done(values);
      }
    });
  }, [formulaParser, store, handleCut, handleCopy, handlePaste]);

  const rootNode = React.useMemo(
    () => (
      <div
        ref={rootRef}
        className={classNames("Spreadsheet", className)}
        onKeyPress={onKeyPress}
        onKeyDown={handleKeyDown}
        onMouseMove={handleMouseMove}
      >
        <Table
          columns={size.columns}
          hideColumnIndicators={hideColumnIndicators}
        >
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
        <ActiveCell
          // @ts-ignore
          DataEditor={DataEditor}
          getBindingsForCell={getBindingsForCell}
        />
        <Selected />
        <Copied />
      </div>
    ),
    [
      className,
      onKeyPress,
      handleKeyDown,
      handleMouseMove,
      Table,
      size,
      hideColumnIndicators,
      Row,
      hideRowIndicators,
      CornerIndicator,
      DataEditor,
      getBindingsForCell,
      columnLabels,
      ColumnIndicator,
      rowLabels,
      RowIndicator,
      Cell,
      DataViewer,
      formulaParser,
    ]
  );

  return <Provider store={store}>{rootNode}</Provider>;
};

export default Spreadsheet;
