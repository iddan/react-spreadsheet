/**
 * Immutable interface for Matrices
 *
 * @todo use Types.Point for all point references
 *
 * @flow
 */

import { range as _range } from "./util";
import * as Types from "./types";

export type Matrix<T> = Array<Array<T | typeof undefined>>;

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

/** Creates a slice of matrix from startPoint up to, but not including, endPoint. */
export function slice<T>(
  startPoint: Types.Point,
  endPoint: Types.Point,
  matrix: Matrix<T>
): Matrix<T> {
  let sliced = [];
  const columns = endPoint.column - startPoint.column;
  for (let row = startPoint.row; row <= endPoint.row; row++) {
    const slicedRow = row - startPoint.row;
    sliced[slicedRow] = sliced[slicedRow] || Array(columns);
    for (let column = startPoint.column; column <= endPoint.column; column++) {
      sliced[slicedRow][column - startPoint.column] = get(row, column, matrix);
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
  const firstRow = matrix[0];
  const nextFirstRow = firstRow ? [...firstRow] : [];
  if (nextFirstRow.length - 1 < column) {
    nextFirstRow[column] = undefined;
    nextMatrix[0] = nextFirstRow;
  }

  const nextRow = matrix[row] ? [...matrix[row]] : [];
  nextRow[column] = value;
  nextMatrix[row] = nextRow;

  return nextMatrix;
}

/** Like Matrix.set() but mutates the matrix */
export function mutableSet<T>(
  row: number,
  column: number,
  value: T,
  matrix: Matrix<T>
): void {
  let firstRow = matrix[0];
  if (!firstRow) {
    firstRow = [];
    matrix[0] = firstRow;
  }
  if (!(row in matrix)) {
    matrix[row] = [];
  }
  // Synchronize first row length
  if (!(column in firstRow)) {
    firstRow[column] = undefined;
  }
  matrix[row][column] = value;
}

/** Removes the coordinate of matrix */
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

export function reduce<T, A>(
  func: (A, T | typeof undefined, Types.Point) => A,
  matrix: Matrix<T>,
  initialValue: A
): A {
  const { rows, columns } = getSize(matrix);
  let acc = initialValue;
  for (let row = 0; row < rows; row++) {
    if (!matrix[row]) {
      continue;
    }
    for (let column = 0; column < columns; column++) {
      if (column in matrix[row]) {
        acc = func(acc, matrix[row][column], { row, column });
      }
    }
  }
  return acc;
}

/** Creates an array of values by running each element in collection thru iteratee. */
export function map<T, T2>(
  func: (T | typeof undefined, Types.Point) => T2,
  matrix: Matrix<T>
): Matrix<T2> {
  return reduce(
    (acc, value, point) => {
      mutableSet(point.row, point.column, func(value, point), acc);
      return acc;
    },
    matrix,
    ([]: Matrix<T2>)
  );
}

/**
 * Converts all elements in row into a string separated by horizontalSeparator and each row string
 * to string separated by verticalSeparator
 */
export function join(
  matrix: Matrix<*>,
  horizontalSeparator: string = "\t",
  verticalSeparator: string = "\n"
): string {
  let joined = "";
  const { rows, columns } = getSize(matrix);
  for (let row = 0; row < rows; row++) {
    if (row) {
      joined += verticalSeparator;
    }
    for (let column = 0; column < columns; column++) {
      if (column) {
        joined += horizontalSeparator;
      }
      if (matrix[row] && column in matrix[row]) {
        joined += String(matrix[row][column]);
      }
    }
  }
  return joined;
}

/* Parses a CSV separated by a horizontalSeparator and verticalSeparator into a Matrix */
export function split<T: *>(
  csv: string,
  getValue: (value: string) => T,
  horizontalSeparator: string = "\t",
  verticalSeparator: string | RegExp = /\r\n|\n|\r/
): Matrix<{| value: string |}> {
  return csv
    .split(verticalSeparator)
    .map(row => row.split(horizontalSeparator).map(getValue));
}

/** Returns whether the point exists in the matrix or not. */
export function has(row: number, column: number, matrix: Matrix<any>): boolean {
  const firstRow = matrix[0];
  return (
    firstRow &&
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
export function getSize(matrix: Matrix<any>): Size {
  const firstRow = matrix[0];
  return {
    columns: firstRow ? firstRow.length : 0,
    rows: matrix.length
  };
}

/** Creates an array of points (positive and/or negative) progressing from startPoint up to, but not including, endPoint. */
export function range(
  endPoint: Types.Point,
  startPoint: Types.Point
): Types.Point[] {
  const points = [];
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

  for (let i = 0; i < rowsRange.length; i++) {
    const row = rowsRange[i];
    for (let j = 0; j < columnsRange.length; j++) {
      const column = columnsRange[j];
      points.push({ row, column });
    }
  }

  return points;
}

/** Like Matrix.range() but including endPoint. */
export const inclusiveRange: typeof range = (endPoint, startPoint) =>
  range(
    {
      row: endPoint.row + Math.sign(endPoint.row - startPoint.row),
      column: endPoint.column + Math.sign(endPoint.column - startPoint.column)
    },
    startPoint
  );

export function toArray<T1, T2>(
  matrix: Matrix<T1>,
  transform: ?(T1 | typeof undefined) => T2
): Array<T1> | Array<T2> {
  let array = [];
  for (let row = 0; row < matrix.length; row++) {
    for (let column = 0; column < matrix.length; column++) {
      const value = matrix[row][column];
      array.push(transform ? transform(value) : value);
    }
  }
  return array;
}
