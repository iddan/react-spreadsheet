import {
  getReferences,
  getFormula,
  getBindingsForCell,
  isFormula,
} from "./bindings";
import { Matrix } from "./matrix";
import { CellBase } from "./types";

const EXAMPLE_CELL = { value: 42 };
const A1 = "A1";
const A2 = "A2";
const A1_POINT = { row: 0, column: 0 };
const A2_POINT = { row: 1, column: 0 };
const B1 = "B1";
const B1_POINT = { row: 0, column: 1 };
const B2 = "B2";
const B2_POINT = { row: 1, column: 1 };
const SUM_A1_A2_FORMULA = `=SUM(${A1}, ${A2})`;
const SUM_B1_B2_FORMULA = `=SUM(${B1}, ${B2})`;
const EXAMPLE_FORMULA_CELL = { value: SUM_A1_A2_FORMULA };
const EMPTY_DATA: Matrix<CellBase> = [];
const EXAMPLE_DATA = [
  [{ value: 1 }, { value: 2 }],
  [{ value: SUM_B1_B2_FORMULA }, { value: 3 }],
];

describe("isFormula", () => {
  const cases = [
    ["formula", SUM_A1_A2_FORMULA, true],
    ["non-formula", "", false],
  ];
  test.each(cases)("%s", (name, formula, expected) => {
    expect(isFormula(formula)).toBe(expected);
  });
});

describe("getFormula", () => {
  const cases: Array<[string, CellBase, string | null]> = [
    ["regular cell", EXAMPLE_CELL, null],
    ["formula cell", EXAMPLE_FORMULA_CELL, SUM_A1_A2_FORMULA],
  ];
  test.each(cases)("%s", (name, cell, expected) => {
    expect(getFormula(cell)).toBe(expected);
  });
});

describe("getReferences", () => {
  test("gets references", () => {
    expect(getReferences(SUM_A1_A2_FORMULA)).toEqual([A1_POINT, A2_POINT]);
  });
});

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
