// @flow
/**
 * @todo own cell pointer in this module
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
  endPoint: Types.CellPointer,
  startPoint: Types.CellPointer
): Types.CellPointer[] =>
  flatMap(_range(endPoint.row, startPoint.row), row =>
    _range(endPoint.column, startPoint.column).map(column => ({ row, column }))
  );
