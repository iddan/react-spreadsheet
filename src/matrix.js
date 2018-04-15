// @flow
/**
 * @todo use Types.Point
 */

import { range as _range, flatMap } from "./util";
import * as Types from "./types";

export type Matrix<T> = Array<T[] | typeof undefined>;

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

export function set<T>(
  row: number,
  column: number,
  value: T,
  matrix: Matrix<T>
): Matrix<T> {
  const nextRow = matrix[row] ? [...matrix[row]] : [];
  nextRow[column] = value;
  const nextMatrix = [...matrix];
  nextMatrix[row] = nextRow;
  return nextMatrix;
}

export function filter<T>(func: T => boolean, matrix: Matrix<T>): Matrix<T> {
  return matrix
    .map(row => row && row.filter(func))
    .filter(row => row && row.length);
}

export function map<T, T2>(func: T => T2, matrix: Matrix<T>): Matrix<T2> {
  return matrix.map(row => row && row.map(func));
}

export function join(
  matrix: Matrix<*>,
  horizontalSeparator: string = ", ",
  verticalSeparator: string = "\n"
): string {
  return matrix
    .map(row => row && row.join(horizontalSeparator))
    .join(verticalSeparator);
}

export function has(row: number, column: number, matrix: Matrix<*>): boolean {
  return Boolean(matrix[row] && matrix[row][column]);
}

type Size = $Exact<{ columns: number, rows: number }>;

export function getSize(matrix: Matrix<*>): Size {
  const [firstRow] = matrix;
  return {
    columns: firstRow ? firstRow.length : 0,
    rows: matrix.length
  };
}

export function range(
  endPoint: Types.Point,
  startPoint: Types.Point
): Types.Point[] {
  return flatMap(_range(endPoint.row, startPoint.row), row =>
    _range(endPoint.column, startPoint.column).map(column => ({ row, column }))
  );
}
