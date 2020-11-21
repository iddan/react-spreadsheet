import * as Types from "./types";
import { Matrix } from "./matrix";
import { Parser as FormulaParser } from "hot-formula-parser";

export const moveCursorToEnd = (el: HTMLInputElement) => {
  el.selectionStart = el.selectionEnd = el.value.length;
};

export function memoizeOne<Input, Output>(
  fn: (arg: Input) => Output
): (arg: Input) => Output {
  let lastArgument: Input;
  let lastResult: Output;

  return function (argument: Input) {
    if (lastArgument !== argument) {
      lastArgument = argument;
      lastResult = fn.call(this, argument);
    }

    return lastResult;
  };
}

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

export function updateData<Cell extends Types.CellBase<Value>, Value>(
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

export function setCell<Cell extends Types.CellBase<Value>, Value>(
  state: {
    data: Matrix<Cell>;
  },
  active: Types.Point,
  cell: Cell
): Matrix<Cell> {
  return updateData(state.data, {
    ...active,
    data: cell,
  });
}

export function isActive(
  active: Types.StoreState<Types.CellBase<unknown>, unknown>["active"],
  { row, column }: Types.Point
): boolean {
  return Boolean(active && column === active.column && row === active.row);
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
  if (event.clipboardData) {
    event.clipboardData.setData("text/plain", data);
  }
};

export const readTextFromClipboard = (event: ClipboardEvent): string => {
  // @ts-ignore
  if (window.clipboardData && window.clipboardData.getData) {
    // @ts-ignore
    return window.clipboardData.getData("Text");
  }
  if (event.clipboardData && event.clipboardData.getData) {
    return event.clipboardData.getData("text/plain");
  }
  return "";
};

export function createEmptyMatrix<T>(rows: number, columns: number): Matrix<T> {
  return range(rows).map(() => Array(columns));
}

export const getCellDimensions = (
  point: Types.Point,
  state: Types.StoreState<Types.CellBase<unknown>, unknown>
): Types.Dimensions | null => {
  const rowDimensions = state.rowDimensions[point.row];
  const columnDimensions = state.columnDimensions[point.column];
  return (
    rowDimensions &&
    columnDimensions && { ...rowDimensions, ...columnDimensions }
  );
};

export function getComputedValue<Cell extends Types.CellBase<Value>, Value>({
  getValue,
  cell,
  column,
  row,
  formulaParser,
}: {
  getValue: Types.GetValue<Cell, Value>;
  cell: Cell | undefined;
  column: number;
  row: number;
  formulaParser: FormulaParser;
}): Value | string {
  const rawValue = getValue({ data: cell, column, row });
  if (typeof rawValue === "string" && rawValue.startsWith("=")) {
    const { result, error } = formulaParser.parse(rawValue.slice(1));
    return error || result;
  }
  return rawValue;
}
