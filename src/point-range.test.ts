import * as PointRange from "./point-range";
import * as Point from "./point";

const POINT_0_1: Point.Point = { row: 0, column: 1 };
const POINT_0_2: Point.Point = { row: 0, column: 2 };

describe("PointRange.iterate()", () => {
  const cases: Array<[string, PointRange.PointRange, Point.Point[]]> = [
    [
      "Range of size 1",
      PointRange.create(Point.ORIGIN, Point.ORIGIN),
      [Point.ORIGIN],
    ],
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
    ["Range of size 1", PointRange.create(Point.ORIGIN, Point.ORIGIN), 1],
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
    [
      "Exists",
      PointRange.create(Point.ORIGIN, Point.ORIGIN),
      Point.ORIGIN,
      true,
    ],
    [
      "Does not exist",
      PointRange.create(Point.ORIGIN, Point.ORIGIN),
      POINT_0_1,
      false,
    ],
  ];
  test.each(cases)("%s", (name, range, point, expected) => {
    expect(PointRange.has(range, point)).toEqual(expected);
  });
});
