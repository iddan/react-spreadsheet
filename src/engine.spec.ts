import * as hotFormulaParser from "hot-formula-parser";
import * as Formula from "./formula";
import { getFormulaComputedValue } from "./engine";

const MOCK_PARSE = jest.fn();
const MOCK_FORMULA_PARSER = {
  parse: MOCK_PARSE,
} as unknown as hotFormulaParser.Parser;
const EXAMPLE_FORMULA_RESULT = true;
const EXAMPLE_FORMULA_ERROR = "EXAMPLE_ERROR";
const EXAMPLE_FORMULA_CELL = { value: "=A1" };

describe("getFormulaComputedValue()", () => {
  const cases = [
    [
      "Returns parsed formula result",
      EXAMPLE_FORMULA_RESULT,
      { result: EXAMPLE_FORMULA_RESULT, error: null },
    ],
    [
      "Returns parsed formula error",
      EXAMPLE_FORMULA_ERROR,
      { result: null, error: EXAMPLE_FORMULA_ERROR },
    ],
  ] as const;
  test.each(cases)("%s", (name, expected, mockParseReturn) => {
    MOCK_PARSE.mockImplementationOnce(() => mockParseReturn);
    expect(
      getFormulaComputedValue({
        formulaParser: MOCK_FORMULA_PARSER,
        cell: EXAMPLE_FORMULA_CELL,
      })
    ).toBe(expected);
    expect(MOCK_FORMULA_PARSER.parse).toBeCalledTimes(1);
    expect(MOCK_FORMULA_PARSER.parse).toBeCalledWith(
      Formula.extractFormula(EXAMPLE_FORMULA_CELL.value)
    );
  });
});
