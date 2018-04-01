// @flow

import * as Types from "./types";
import type { Matrix } from "./matrix";

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

export function flatMap<T1, T2>(array: T1[], func: T1 => T2 | T2[]): T2[] {
  let acc = [];
  for (let i = 0; i < array.length; i++) {
    let value = func(array[i]);
    acc = acc.concat(value);
  }
  return acc;
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
  state: { data: Matrix<Cell>, active: Types.CellPointer },
  cell: Cell
): Matrix<Cell> {
  return updateData(state.data, {
    ...state.active,
    data: cell
  });
}

export function isActive(
  active: $PropertyType<Types.StoreState<*>, "active">,
  { row, column }: Types.CellPointer
): boolean {
  return Boolean(active && column === active.column && row === active.row);
}

const CAPITAL_A_CODE = 65;
const ALPHABET_LENGTH = 26;

export const toColumnLetter = (number: number): string => {
  if (number < 0) {
    throw new Error("Number must be greater than 0");
  }
  if (number < ALPHABET_LENGTH) {
    return String.fromCharCode(CAPITAL_A_CODE + number);
  }
  return (
    toColumnLetter(Math.floor(number / ALPHABET_LENGTH)) +
    toColumnLetter(number % ALPHABET_LENGTH)
  );
};
