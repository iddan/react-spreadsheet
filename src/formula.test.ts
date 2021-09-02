import * as Point from "./point";
import {
  isFormulaValue,
  getReferences,
  extractFormula,
  PREFIX,
} from "./formula";

const A1 = "A1";
const A2 = "A2";
const A1_POINT: Point.Point = { row: 0, column: 0 };
const A2_POINT: Point.Point = { row: 1, column: 0 };
const SUM_A1_A2_FORMULA = `SUM(${A1}, ${A2})`;
const EXAMPLE_FORMULA = "TRUE()";
const EXAMPLE_FORMULA_VALUE = `${PREFIX}${EXAMPLE_FORMULA}`;

describe("isFormulaValue", () => {
  const cases = [
    ["formula value", EXAMPLE_FORMULA_VALUE, true],
    ["non-formula value", "", false],
  ];
  test.each(cases)("%s", (name, formula, expected) => {
    expect(isFormulaValue(formula)).toBe(expected);
  });
});

describe("extractFormula()", () => {
  test("extracts formula from given cell value", () => {
    expect(extractFormula(EXAMPLE_FORMULA_VALUE)).toBe(EXAMPLE_FORMULA);
  });
});

describe("getReferences", () => {
  test("gets references", () => {
    expect(getReferences(SUM_A1_A2_FORMULA)).toEqual([A1_POINT, A2_POINT]);
  });
});
