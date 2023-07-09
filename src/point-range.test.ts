import { PointRange } from "./point-range";
import * as Point from "./point";

const POINT_0_1: Point.Point = { row: 0, column: 1 };
const POINT_0_2: Point.Point = { row: 0, column: 2 };
const ORIGIN_RANGE = new PointRange(Point.ORIGIN, Point.ORIGIN);

describe("PointRange.prototype.iterate()", () => {
  const cases: Array<[string, PointRange, Point.Point[]]> = [
    ["Range of size 1", ORIGIN_RANGE, [Point.ORIGIN]],
    [
      "Range of size 2",
      new PointRange(Point.ORIGIN, POINT_0_1),
      [Point.ORIGIN, POINT_0_1],
    ],
    [
      "Range of size 2, not from zero",
      new PointRange(POINT_0_1, POINT_0_2),
      [POINT_0_1, POINT_0_2],
    ],
  ];
  test.each(cases)("%s", (name, range, expected) => {
    expect(Array.from(range.iterate())).toEqual(expected);
  });
});

describe("PointRange.prototype.size()", () => {
  const cases: Array<[string, PointRange, number]> = [
    ["Range of size 1", ORIGIN_RANGE, 1],
    ["Range of size 2", new PointRange(Point.ORIGIN, POINT_0_1), 2],
    ["Range of size 2, not from zero", new PointRange(POINT_0_1, POINT_0_2), 2],
  ];
  test.each(cases)("%s", (name, range, expected) => {
    expect(range.size()).toEqual(expected);
  });
});

describe("PointRange.prototype.has()", () => {
  const cases: Array<[string, PointRange, Point.Point, boolean]> = [
    ["Exists", ORIGIN_RANGE, Point.ORIGIN, true],
    ["Does not exist", ORIGIN_RANGE, POINT_0_1, false],
  ];
  test.each(cases)("%s", (name, range, point, expected) => {
    expect(range.has(point)).toEqual(expected);
  });
});
