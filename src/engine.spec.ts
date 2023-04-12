import * as Formula from "./formula";
import { getFormulaComputedValue } from "./engine";
import FormulaParser from "fast-formula-parser";
import { ORIGIN } from "./point";

const MOCK_PARSE = jest.fn();
const MOCK_FORMULA_PARSER = {
  parse: MOCK_PARSE,
} as unknown as FormulaParser;
const EXAMPLE_FORMULA_RESULT = 42;
const EXAMPLE_FORMULA_ERROR = "EXAMPLE_ERROR";
const EXAMPLE_FORMULA_CELL = { value: "=A1" };

describe("getFormulaComputedValue()", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  const cases: Array<
    [name: string, expected: number | string, mockParseReturn: number | string]
  > = [
    [
      "Returns parsed formula result",
      EXAMPLE_FORMULA_RESULT,
      EXAMPLE_FORMULA_RESULT,
    ],
    [
      "Returns parsed formula error",
      EXAMPLE_FORMULA_ERROR,
      EXAMPLE_FORMULA_ERROR,
    ],
  ];
  test.each(cases)("%s", (name, expected, mockParseReturn) => {
    MOCK_PARSE.mockImplementationOnce(() => mockParseReturn);
    expect(
      getFormulaComputedValue(EXAMPLE_FORMULA_CELL, ORIGIN, MOCK_FORMULA_PARSER)
    ).toBe(expected);
    expect(MOCK_FORMULA_PARSER.parse).toBeCalledTimes(1);
    expect(MOCK_FORMULA_PARSER.parse).toBeCalledWith(
      Formula.extractFormula(EXAMPLE_FORMULA_CELL.value),
      { col: 1, row: 1, sheet: "Sheet1" }
    );
  });
});
