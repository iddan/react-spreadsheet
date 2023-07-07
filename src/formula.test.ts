import * as Point from "./point";
import { PointSet } from "./point-set";
import {
  isFormulaValue,
  getReferences,
  extractFormula,
  FORMULA_VALUE_PREFIX,
  evaluate,
  createBoundFormulaParser,
} from "./formula";

const A1 = "A1";
const A2 = "A2";
const A1_POINT: Point.Point = { row: 0, column: 0 };
const A2_POINT: Point.Point = { row: 1, column: 0 };
const SUM_A1_A2_FORMULA = `SUM(${A1}, ${A2})`;
const EXAMPLE_FORMULA = "TRUE()";
const EXAMPLE_FORMULA_VALUE = `${FORMULA_VALUE_PREFIX}${EXAMPLE_FORMULA}`;

describe("isFormulaValue()", () => {
  const cases = [
    ["formula value", EXAMPLE_FORMULA_VALUE, true],
    ["just equals", "=", false],
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

describe("getReferences()", () => {
  test("gets simple references", () => {
    expect(
      getReferences(SUM_A1_A2_FORMULA, Point.ORIGIN, [
        [{ value: 1 }],
        [{ value: 2 }],
      ])
    ).toEqual(PointSet.from([A1_POINT, A2_POINT]));
  });
  test("gets range references", () => {
    const references = getReferences("SUM(A:A)", Point.ORIGIN, [
      [{ value: 1 }],
      [{ value: 2 }],
    ]);

    expect(references).toEqual(PointSet.from([A1_POINT, A2_POINT]));
  });
});

describe("evaluate()", () => {
  test("evaluates formula", () => {
    const formulaParser = createBoundFormulaParser(() => []);
    expect(evaluate(EXAMPLE_FORMULA, Point.ORIGIN, formulaParser)).toBe(true);
  });
  test("evaluates sum formula", () => {
    const data = [[{ value: 1 }], [{ value: 2 }]];
    const formulaParser = createBoundFormulaParser(() => data);
    expect(
      evaluate(SUM_A1_A2_FORMULA, { row: 1, column: 1 }, formulaParser)
    ).toBe(3);
  });
});
