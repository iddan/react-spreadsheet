import * as Point from "./point";

const EXAMPLE_POINT: Point.Point = { row: 0, column: 0 };
const EXAMPLE_POINT_COPY: Point.Point = { row: 0, column: 0 };
const EXAMPLE_ANOTHER_POINT: Point.Point = { row: 1, column: 1 };

describe("Point.isEqual()", () => {
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
    expect(Point.isEqual(source, target)).toBe(expected);
  });
});
