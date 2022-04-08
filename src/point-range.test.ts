import * as PointRange from "./point-range";
import * as Point from "./point";

const POINT_0_1: Point.Point = { row: 0, column: 1 };
const POINT_0_2: Point.Point = { row: 0, column: 2 };
const ORIGIN_RANGE = PointRange.create(Point.ORIGIN, Point.ORIGIN);

describe("PointRange.is()", () => {
  const cases = [
    ["A point range", ORIGIN_RANGE, true],
    ["Not a point range", null, false],
  ] as const;
  test.each(cases)("%s", (name, value, expected) => {
    expect(PointRange.is(value)).toBe(expected);
  });
});

describe("PointRange.iterate()", () => {
  const cases: Array<[string, PointRange.PointRange, Point.Point[]]> = [
    ["Range of size 1", ORIGIN_RANGE, [Point.ORIGIN]],
    [
      "Range of size 2",
      PointRange.create(Point.ORIGIN, POINT_0_1),
      [Point.ORIGIN, POINT_0_1],
    ],
    [
      "Range of size 2, not from zero",
      PointRange.create(POINT_0_1, POINT_0_2),
      [POINT_0_1, POINT_0_2],
    ],
  ];
  test.each(cases)("%s", (name, range, expected) => {
    expect(Array.from(PointRange.iterate(range))).toEqual(expected);
  });
});

describe("PointRange.size()", () => {
  const cases: Array<[string, PointRange.PointRange, number]> = [
    ["Range of size 1", ORIGIN_RANGE, 1],
    ["Range of size 2", PointRange.create(Point.ORIGIN, POINT_0_1), 2],
    [
      "Range of size 2, not from zero",
      PointRange.create(POINT_0_1, POINT_0_2),
      2,
    ],
  ];
  test.each(cases)("%s", (name, range, expected) => {
    expect(PointRange.size(range)).toEqual(expected);
  });
});

describe("PointRange.has()", () => {
  const cases: Array<[string, PointRange.PointRange, Point.Point, boolean]> = [
    ["Exists", ORIGIN_RANGE, Point.ORIGIN, true],
    ["Does not exist", ORIGIN_RANGE, POINT_0_1, false],
  ];
  test.each(cases)("%s", (name, range, point, expected) => {
    expect(PointRange.has(range, point)).toEqual(expected);
  });
});
