// @flow

import * as Types from "./types";
import * as Matrix from "./matrix";
import { flatMap } from "./util";

/** @todo rename */
export type Type = {
  [row: number]: {
    [column: number]: boolean
  }
};

export function add(selected: Type, { row, column }: Types.CellPointer): Type {
  return { ...selected, [row]: { ...selected[row], [column]: true } };
}

export function remove(
  selected: Type,
  { row, column }: Types.CellPointer
): Type {
  return { ...selected, [row]: { ...selected[row], [column]: false } };
}

export function has(
  selected: Type,
  { row, column }: Types.CellPointer
): boolean {
  return Boolean(selected[row] && selected[row][column]);
}

export function of(cells: Types.CellPointer[]) {
  return cells.reduce(add, Object.create(null));
}

export function isEmpty(selected: Type) {
  return Object.keys(selected).length === 0;
}

export function toArray(selected: Type): Types.CellPointer[] {
  return flatMap(Object.entries(selected), ([row, columns]) =>
    Object.keys(columns).map((column: number) => ({ row, column }))
  );
}

export function toMatrix<Cell>(selected: Type, data: Matrix.Matrix<Cell>) {
  let matrix: Matrix.Matrix<Types.CellDescriptor<Cell>> = [];
  for (const { row, column } of toArray(selected)) {
    matrix = Matrix.set(
      row,
      column,
      { row, column, data: data[row][column] },
      matrix
    );
  }
  return matrix;
}
