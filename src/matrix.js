/**
 * Immutable interface for Matrices
 *
 * @todo use Types.Point for all point references
 *
 * @flow
 */

import { range as _range, flatMap } from "./util";
import * as Types from "./types";

export type Matrix<T> = Array<T[]>;

/** Gets the value at row and column of matrix. */
export function get<T>(
  row: number,
  column: number,
  matrix: Matrix<T>
): T | typeof undefined {
  const columns = matrix[row];
  if (columns === undefined) {
    return undefined;
  }
  return columns[column];
}

export function slice<T>(
  startPoint: Types.Point,
  endPoint: Types.Point,
  matrix: Matrix<T>
): Matrix<T> {
  let sliced = [];
  for (let row = startPoint.row; row <= endPoint.row; row++) {
    for (let column = startPoint.column; column <= endPoint.column; column++) {
      sliced = set(
        row - startPoint.row,
        column - startPoint.column,
        get(row, column, matrix),
        sliced
      );
    }
  }
  return sliced;
}

/** Sets the value at row and column of matrix. If a row doesn't exist, it's created. */
export function set<T>(
  row: number,
  column: number,
  value: T,
  matrix: Matrix<T>
): Matrix<T> {
  const nextMatrix = [...matrix];

  // Synchronize first row length
  const [firstRow = []] = matrix;
  const nextFirstRow = [...firstRow];
  if (firstRow.length - 1 < column) {
    firstRow[column] = undefined;
    nextMatrix[0] = nextFirstRow;
  }

  const nextRow = matrix[row] ? [...matrix[row]] : [];
  nextRow[column] = value;
  nextMatrix[row] = nextRow;

  return nextMatrix;
}

export function unset<T>(
  row: number,
  column: number,
  matrix: Matrix<T>
): Matrix<T> {
  if (!has(row, column, matrix)) {
    return matrix;
  }
  const nextMatrix = [...matrix];
  const nextRow = [...matrix[row]];

  // Avoid deleting to preserve first row length
  nextRow[column] = undefined;
  nextMatrix[row] = nextRow;

  return nextMatrix;
}

/**
 * Iterates over elements of matrix, returning an array of all elements predicate returns truthy for.
 * Empty rows are excluded
 */
export function filter<T>(func: T => boolean, matrix: Matrix<T>): Matrix<T> {
  return matrix
    .map(row => row && row.filter(func))
    .filter(row => row && row.length);
}

/** Creates an array of values by running each element in collection thru iteratee. */
export function map<T, T2>(func: T => T2, matrix: Matrix<T>): Matrix<T2> {
  return matrix.map(row => row && row.map(func));
}

/**
 * Converts all elements in row into a string separated by horizontalSeparator and each row string
 * to string separated by verticalSeparator
 */
export function join(
  matrix: Matrix<*>,
  horizontalSeparator: string = ", ",
  verticalSeparator: string = "\n"
): string {
  return matrix
    .map(row => row && row.join(horizontalSeparator))
    .join(verticalSeparator);
}

/** Returns whether the point exists in the matrix or not. */
export function has(row: number, column: number, matrix: Matrix<*>): boolean {
  const [firstRow = []] = matrix;
  return (
    // validation
    row >= 0 &&
    column >= 0 &&
    Number.isInteger(row) &&
    Number.isInteger(column) &&
    // first row length is in sync with other rows
    column < firstRow.length &&
    row < matrix.length
  );
}

type Size = $Exact<{ columns: number, rows: number }>;

/** Gets the size of matrix by returning its number of rows and columns */
export function getSize(matrix: Matrix<*>): Size {
  const [firstRow] = matrix;
  return {
    columns: firstRow ? firstRow.length : 0,
    rows: matrix.length
  };
}

/** Creates a matrix of numbers (positive and/or negative) progressing from start up to, but not including, end. */
export function range(
  endPoint: Types.Point,
  startPoint: Types.Point
): Types.Point[] {
  const columnsRange =
    startPoint.column !== endPoint.column
      ? _range(endPoint.column, startPoint.column)
      : startPoint.row !== endPoint.row
        ? [startPoint.column]
        : [];

  const rowsRange =
    startPoint.row !== endPoint.row
      ? _range(endPoint.row, startPoint.row)
      : startPoint.column !== endPoint.column
        ? [startPoint.row]
        : [];

  return flatMap(rowsRange, row =>
    columnsRange.map(column => ({ row, column }))
  );
}

export const inclusiveRange: typeof range = (endPoint, startPoint) =>
  range(
    {
      row: endPoint.row + Math.sign(endPoint.row - startPoint.row),
      column: endPoint.column + Math.sign(endPoint.column - startPoint.column)
    },
    startPoint
  );

export function toArray<T>(matrix: Matrix<T>): Array<T> {
  return matrix.reduce((acc, row) => [...acc, ...row], []);
}
