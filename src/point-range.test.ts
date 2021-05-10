import * as PointRange from "./point-range";
import { Point } from "./types";

const POINT_0_0: Point = { row: 0, column: 0 };
const POINT_0_1: Point = { row: 0, column: 1 };
const POINT_0_2: Point = { row: 0, column: 2 };

describe("PointRange.iterate()", () => {
  const cases: Array<[string, PointRange.PointRange, Point[]]> = [
    ["Range of size 1", PointRange.create(POINT_0_0, POINT_0_0), [POINT_0_0]],
    [
      "Range of size 2",
      PointRange.create(POINT_0_0, POINT_0_1),
      [POINT_0_0, POINT_0_1],
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
    ["Range of size 1", PointRange.create(POINT_0_0, POINT_0_0), 1],
    ["Range of size 2", PointRange.create(POINT_0_0, POINT_0_1), 2],
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
