// @flow

import * as Types from "./types";

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
