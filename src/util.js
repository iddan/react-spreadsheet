// @flow

import * as Types from "./types";
import type { Matrix } from "./matrix";
import clipboard from "clipboard-polyfill";

export const moveCursorToEnd = (el: HTMLInputElement) => {
  el.selectionStart = el.selectionEnd = el.value.length;
};

/**
 * Creates an array of numbers (positive and/or negative) progressing from start up to, but not including, end. A step of -1 is used if a negative start is specified without an end or step. If end is not specified, it's set to start with start then set to 0.
 * @param end
 * @param start
 * @param step
 */
export function range(
  end: number,
  start: number = 0,
  step: number = 1
): number[] {
  let array = [];
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

export function updateData<Cell>(
  data: Matrix<Cell>,
  cellDescriptor: Types.CellDescriptor<Cell>
): Matrix<Cell> {
  const row = data[cellDescriptor.row];
  const nextData = [...data];
  const nextRow = row ? [...row] : [];
  nextRow[cellDescriptor.column] = cellDescriptor.data;
  nextData[cellDescriptor.row] = nextRow;
  return nextData;
}

export function setCell<Cell>(
  state: { data: Matrix<Cell>, active: Types.Point },
  active: Types.Point,
  cell: Cell
): Matrix<Cell> {
  return updateData(state.data, {
    ...active,
    data: cell
  });
}

export function isActive(
  active: $PropertyType<Types.StoreState<*>, "active">,
  { row, column }: Types.Point
): boolean {
  return Boolean(active && column === active.column && row === active.row);
}

export const getOffsetRect = (element: HTMLElement): Types.Dimensions => ({
  width: element.offsetWidth,
  height: element.offsetHeight,
  left: element.offsetLeft,
  top: element.offsetTop
});

/**
 * @todo better error management
 */
/**
 * Wraps Clipboard.writeText() with permission check if necessary
 * @param string - The string to be written to the clipboard.
 */
export const writeTextToClipboard = (string: string) => {
  const write = () => clipboard.writeText(string);
  if (navigator.permissions) {
    navigator.permissions
      .query({
        name: "clipboard-read"
      })
      .then(readClipboardStatus => {
        if (readClipboardStatus.state) {
          write();
        }
      });
  } else {
    write();
  }
};
