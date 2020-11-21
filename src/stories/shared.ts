import { createEmptyMatrix, CellBase } from "..";

export const INITIAL_ROWS = 6;
export const INITIAL_COLUMNS = 4;
export const EMPTY_DATA = createEmptyMatrix<CellBase<unknown>>(
  INITIAL_ROWS,
  INITIAL_COLUMNS
);
