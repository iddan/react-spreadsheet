import { isFormula, getReferences } from "./formula";

const A1 = "A1";
const A2 = "A2";
const A1_POINT = { row: 0, column: 0 };
const A2_POINT = { row: 1, column: 0 };
const SUM_A1_A2_FORMULA = `=SUM(${A1}, ${A2})`;

describe("isFormula", () => {
  const cases = [
    ["formula", SUM_A1_A2_FORMULA, true],
    ["non-formula", "", false],
  ];
  test.each(cases)("%s", (name, formula, expected) => {
    expect(isFormula(formula)).toBe(expected);
  });
});

describe("getReferences", () => {
  test("gets references", () => {
    expect(getReferences(SUM_A1_A2_FORMULA)).toEqual([A1_POINT, A2_POINT]);
  });
});
