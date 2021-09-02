import { getBindingsForCell } from "./bindings";
import { Matrix } from "./matrix";
import * as Point from "./point";
import { CellBase } from "./types";

const A1 = "A1";
const A2 = "A2";
const B1 = "B1";
const B2 = "B2";
const A1_POINT: Point.Point = { row: 0, column: 0 };
const A2_POINT: Point.Point = { row: 1, column: 0 };
const B1_POINT: Point.Point = { row: 0, column: 1 };
const B2_POINT: Point.Point = { row: 1, column: 1 };
const SUM_A1_A2_FORMULA = `=SUM(${A1}, ${A2})`;
const SUM_B1_B2_FORMULA = `=SUM(${B1}, ${B2})`;
const EXAMPLE_FORMULA_CELL = { value: SUM_A1_A2_FORMULA };
const EMPTY_DATA: Matrix<CellBase> = [];
const EXAMPLE_DATA: Matrix<CellBase> = [
  [{ value: 1 }, { value: 2 }],
  [{ value: SUM_B1_B2_FORMULA }, { value: 3 }],
];

describe("getBindingsForCell", () => {
  test("gets immediate dependencies", () => {
    expect(getBindingsForCell(EXAMPLE_FORMULA_CELL, EMPTY_DATA)).toEqual([
      A1_POINT,
      A2_POINT,
    ]);
  });
  test("gets 2nd level dependencies", () => {
    expect(getBindingsForCell(EXAMPLE_FORMULA_CELL, EXAMPLE_DATA)).toEqual([
      A1_POINT,
      A2_POINT,
      B1_POINT,
      B2_POINT,
    ]);
  });
});
