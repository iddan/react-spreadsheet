import * as Types from "./types";
import * as Matrix from "./matrix";
import * as Point from "./point";
import * as hotFormulaParser from "hot-formula-parser";
import * as PointRange from "./point-range";

export type FormulaParseResult = string | boolean | number;
export type FormulaParseError = string;

export const FORMULA_VALUE_PREFIX = "=";
export const PLAIN_TEXT_MIME = "text/plain";

export const moveCursorToEnd = (el: HTMLInputElement): void => {
  el.selectionStart = el.selectionEnd = el.value.length;
};

/**
 * Creates an array of numbers (positive and/or negative) progressing from start up to, but not including, end. A step of -1 is used if a negative start is specified without an end or step. If end is not specified, it's set to start with start then set to 0.
 * @param end - an integer number specifying at which position to stop (not included).
 * @param start - An integer number specifying at which position to start.
 * @param step - An integer number specifying the incrementation
 */
export function range(end: number, start = 0, step = 1): number[] {
  const array = [];
  if (Math.sign(end - start) === -1) {
    for (let element = start; element > end; element -= step) {
      array.push(element);
    }
    return array;
  }
  for (let element = start; element < end; element += step) {
    array.push(element);
  }
  return array;
}

/** Return whether given point is active */
export function isActive(
  active: Types.StoreState["active"],
  point: Point.Point
): boolean {
  return Boolean(active && Point.isEqual(point, active));
}

export const getOffsetRect = (element: HTMLElement): Types.Dimensions => ({
  width: element.offsetWidth,
  height: element.offsetHeight,
  left: element.offsetLeft,
  top: element.offsetTop,
});

export const writeTextToClipboard = (
  event: ClipboardEvent,
  data: string
): void => {
  event.clipboardData?.setData(PLAIN_TEXT_MIME, data);
};

export const readTextFromClipboard = (event: ClipboardEvent): string => {
  // @ts-ignore
  if (window.clipboardData && window.clipboardData.getData) {
    // @ts-ignore
    return window.clipboardData.getData("Text");
  }
  if (event.clipboardData && event.clipboardData.getData) {
    return event.clipboardData.getData(PLAIN_TEXT_MIME);
  }
  return "";
};

/**
 * Creates an empty matrix with given rows and columns
 * @param rows - integer, the amount of rows the matrix should have
 * @param columns - integer, the amount of columns the matrix should have
 * @returns an empty matrix with given rows and columns
 */
export function createEmptyMatrix<T>(
  rows: number,
  columns: number
): Matrix.Matrix<T> {
  return range(rows).map(() => Array(columns));
}

export const getCellDimensions = (
  point: Point.Point,
  state: Types.StoreState
): Types.Dimensions | undefined => {
  const rowDimensions = state.rowDimensions[point.row];
  const columnDimensions = state.columnDimensions[point.column];
  return (
    rowDimensions &&
    columnDimensions && { ...rowDimensions, ...columnDimensions }
  );
};

/** Get the dimensions of a range of cells */
export function getRangeDimensions(
  state: Types.StoreState,
  range: PointRange.PointRange
): Types.Dimensions | undefined {
  const startDimensions = getCellDimensions(range.start, state);
  const endDimensions = getCellDimensions(range.end, state);
  return (
    startDimensions &&
    endDimensions && {
      width: endDimensions.left + endDimensions.width - startDimensions.left,
      height: endDimensions.top + endDimensions.height - startDimensions.top,
      top: startDimensions.top,
      left: startDimensions.left,
    }
  );
}

/** Get the computed value of a cell. */
export function getComputedValue<Cell extends Types.CellBase<Value>, Value>({
  cell,
  formulaParser,
}: {
  cell: Cell | undefined;
  formulaParser: hotFormulaParser.Parser;
}): Value | FormulaParseResult | FormulaParseError | null {
  if (cell === undefined) {
    return null;
  }
  if (isFormulaCell(cell)) {
    return getFormulaComputedValue({ cell, formulaParser });
  }
  return cell.value;
}

/** Get the computed value of a formula cell */
export function getFormulaComputedValue({
  cell,
  formulaParser,
}: {
  cell: Types.CellBase<string>;
  formulaParser: hotFormulaParser.Parser;
}): FormulaParseResult | FormulaParseError | null {
  const formula = extractFormula(cell.value);
  const { result, error } = formulaParser.parse(formula);
  return error || result;
}

/** Returns whether given cell contains a formula value */
export function isFormulaCell(
  cell: Types.CellBase
): cell is Types.CellBase<string> {
  return (
    typeof cell.value === "string" &&
    cell.value.startsWith(FORMULA_VALUE_PREFIX)
  );
}

/** Extracts formula from formula cell value */
export function extractFormula(cellValue: string): string {
  return cellValue.slice(1);
}

export function normalizeSelected(
  selected: PointRange.PointRange | null,
  data: Matrix.Matrix<unknown>
): PointRange.PointRange | null {
  const dataSize = Matrix.getSize(data);
  const dataRange = PointRange.create(
    { row: 0, column: 0 },
    { row: dataSize.rows - 1, column: dataSize.columns - 1 }
  );
  return selected && PointRange.mask(selected, dataRange);
}

export function getSelectedCSV(
  selected: PointRange.PointRange | null,
  data: Matrix.Matrix<Types.CellBase>
): string {
  if (!selected) {
    return "";
  }
  const slicedMatrix = Matrix.slice(selected.start, selected.end, data);
  const valueMatrix = Matrix.map((cell) => cell?.value || "", slicedMatrix);
  return Matrix.join(valueMatrix);
}

/**
 * Calculate the rows and columns counts of a spreadsheet
 * @param data - the spreadsheet's data
 * @param rowLabels - the spreadsheet's row labels (if defined)
 * @param columnLabels - the spreadsheet's column labels (if defined)
 * @returns the rows and columns counts of a spreadsheet
 */
export function calculateSpreadsheetSize(
  data: Matrix.Matrix<unknown>,
  rowLabels?: string[],
  columnLabels?: string[]
): Matrix.Size {
  const { columns, rows } = Matrix.getSize(data);
  return {
    rows: rowLabels ? Math.max(rows, rowLabels.length) : rows,
    columns: columnLabels ? Math.max(columns, columnLabels.length) : columns,
  };
}
