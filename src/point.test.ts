import { isEqual } from "./point";

const EXAMPLE_POINT = { row: 0, column: 0 };
const EXAMPLE_POINT_COPY = { row: 0, column: 0 };
const EXAMPLE_ANOTHER_POINT = { row: 1, column: 1 };

describe("isEqual()", () => {
  const cases = [
    ["returns true for equal points", EXAMPLE_POINT, EXAMPLE_POINT_COPY, true],
    [
      "returns false for non equal points",
      EXAMPLE_POINT,
      EXAMPLE_ANOTHER_POINT,
      false,
    ],
  ] as const;
  test.each(cases)("%s", (name, source, target, expected) => {
    expect(isEqual(source, target)).toBe(expected);
  });
});
