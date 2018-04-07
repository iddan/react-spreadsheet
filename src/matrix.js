// @flow
/**
 * @todo use Types.Point
 */

import { range as _range, flatMap } from "./util";
import * as Types from "./types";

export type Matrix<T> = Array<T[] | typeof undefined>;

export const get = <T>(
  row: number,
  column: number,
  matrix: Matrix<T>
): T | typeof undefined => {
  const columns = matrix[row];
  if (columns === undefined) {
    return undefined;
  }
  return columns[column];
};

export const set = <T>(
  row: number,
  column: number,
  value: T,
  matrix: Matrix<T>
): Matrix<T> => {
  const nextRow = matrix[row] ? [...matrix[row]] : [];
  nextRow[column] = value;
  const nextMatrix = [...matrix];
  nextMatrix[row] = nextRow;
  return nextMatrix;
};

export const filter = <T>(func: T => boolean, matrix: Matrix<T>): Matrix<T> =>
  matrix.map(row => row && row.filter(func)).filter(row => row && row.length);

export const map = <T, T2>(func: T => T2, matrix: Matrix<T>): Matrix<T2> =>
  matrix.map(row => row && row.map(func));

export const join = (
  matrix: Matrix<*>,
  horizontalSeparator: string = ", ",
  verticalSeparator: string = "\n"
): string =>
  matrix
    .map(row => row && row.join(horizontalSeparator))
    .join(verticalSeparator);

export const has = (row: number, column: number, matrix: Matrix<*>): boolean =>
  Boolean(matrix[row] && matrix[row][column]);

export const getSize = (
  matrix: Matrix<*>
): {| columns: number, rows: number |} => {
  const [firstRow] = matrix;
  return {
    columns: firstRow ? firstRow.length : 0,
    rows: matrix.length
  };
};

export const range = (
  endPoint: Types.Point,
  startPoint: Types.Point
): Types.Point[] =>
  flatMap(_range(endPoint.row, startPoint.row), row =>
    _range(endPoint.column, startPoint.column).map(column => ({ row, column }))
  );
