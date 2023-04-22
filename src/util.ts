import * as Types from "./types";
import * as Matrix from "./matrix";
import * as Point from "./point";
import * as PointRange from "./point-range";
import * as Selection from "./selection";
import * as PointMap from "./point-map";
import * as PointSet from "./point-set";

export { createEmpty as createEmptyMatrix } from "./matrix";

export const PLAIN_TEXT_MIME = "text/plain";
export const FOCUS_WITHIN_SELECTOR = ":focus-within";

/** Move the cursor of given input element to the input's end */
export function moveCursorToEnd(el: HTMLInputElement): void {
  el.selectionStart = el.selectionEnd = el.value.length;
}

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

/** Get the offset values of given element */
export function getOffsetRect(element: HTMLElement): Types.Dimensions {
  return {
    width: element.offsetWidth,
    height: element.offsetHeight,
    left: element.offsetLeft,
    top: element.offsetTop,
  };
}

/** Write given data to clipboard with given event */
export function writeTextToClipboard(
  event: ClipboardEvent,
  data: string
): void {
  event.clipboardData?.setData(PLAIN_TEXT_MIME, data);
}

/** Read text from given clipboard event */
export function readTextFromClipboard(event: ClipboardEvent): string {
  // @ts-ignore
  if (window.clipboardData && window.clipboardData.getData) {
    // @ts-ignore
    return window.clipboardData.getData("Text");
  }
  if (event.clipboardData && event.clipboardData.getData) {
    return event.clipboardData.getData(PLAIN_TEXT_MIME);
  }
  return "";
}

/** Get the dimensions of cell at point from state */
export function getCellDimensions(
  point: Point.Point,
  rowDimensions: Types.StoreState["rowDimensions"] | undefined,
  columnDimensions: Types.StoreState["columnDimensions"] | undefined
): Types.Dimensions | undefined {
  const cellRowDimensions = rowDimensions && rowDimensions[point.row];
  const cellColumnDimensions =
    columnDimensions && columnDimensions[point.column];
  return (
    cellRowDimensions &&
    cellColumnDimensions && {
      ...cellRowDimensions,
      ...cellColumnDimensions,
    }
  );
}

/** Get the dimensions of a range of cells */
export function getRangeDimensions(
  rowDimensions: Types.StoreState["rowDimensions"],
  columnDimensions: Types.StoreState["columnDimensions"],
  range: PointRange.PointRange
): Types.Dimensions | undefined {
  const startDimensions = getCellDimensions(
    range.start,
    rowDimensions,
    columnDimensions
  );
  const endDimensions = getCellDimensions(
    range.end,
    rowDimensions,
    columnDimensions
  );
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

/** Get the dimensions of selected */
export function getSelectedDimensions(
  rowDimensions: Types.StoreState["rowDimensions"],
  columnDimensions: Types.StoreState["columnDimensions"],
  data: Matrix.Matrix<unknown>,
  selected: Selection.Selection
): Types.Dimensions | undefined {
  const range = Selection.toRange(selected, data);
  return range
    ? getRangeDimensions(rowDimensions, columnDimensions, range)
    : undefined;
}

/** Get given data as CSV */
export function getCSV(data: Matrix.Matrix<Types.CellBase>): string {
  const valueMatrix = Matrix.map((cell) => cell?.value || "", data);
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

/** Transform given point map to a point set */
export function convertPointMapToPointSet(
  map: PointMap.PointMap<unknown>
): PointSet.PointSet {
  return PointMap.map(() => true, map);
}

/** Get the range of copied cells. If none are copied return null */
export function getCopiedRange(
  copied: Types.StoreState["copied"],
  hasPasted: boolean
): PointRange.PointRange | null {
  if (hasPasted || PointMap.isEmpty(copied)) {
    return null;
  }
  const set = convertPointMapToPointSet(copied);
  return PointSet.toRange(set);
}

/** Should spreadsheet handle clipboard event */
export function shouldHandleClipboardEvent(
  root: Element | null,
  mode: Types.Mode
): boolean {
  return root !== null && mode === "view" && isFocusedWithin(root);
}

export function isFocusedWithin(element: Element): boolean {
  return element.matches(FOCUS_WITHIN_SELECTOR);
}
