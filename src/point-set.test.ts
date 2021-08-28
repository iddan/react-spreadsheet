import * as PointSet from "./point-set";
import { Point } from "./types";

const set = PointSet.from([
  { row: 0, column: 0 },
  { row: 0, column: 1 },
  { row: 1, column: 1 },
  { row: 2, column: 2 },
]);

describe("PointSet.from()", () => {
  test("Creates a new PointSet instance from an array-like or iterable object", () => {
    expect(set).toEqual({
      0: { 0: true, 1: true },
      1: { 1: true },
      2: { 2: true },
    });
  });
});

describe("PointSet.has()", () => {
  test("Returns a boolean asserting whether an point is present with the given value in the Set object or not", () => {
    expect(PointSet.has(set, { row: 2, column: 2 })).toBe(true);
  });
});

describe("PointSet.size()", () => {
  test("Returns the number of points in a PointSet object", () => {
    expect(PointSet.size(set)).toBe(4);
  });
});

describe("PointSet.reduce()", () => {
  test("Applies a function against an accumulator and each point in the set (from left to right) to reduce it to a single value", () => {
    expect(
      PointSet.reduce((acc, point) => [...acc, point], set, [] as Point[])
    ).toEqual([
      { row: 0, column: 0 },
      { row: 0, column: 1 },
      { row: 1, column: 1 },
      { row: 2, column: 2 },
    ]);
  });
});

describe("PointSet.filter()", () => {
  test("Creates a new set with all points that pass the test implemented by the provided function", () => {
    expect(
      PointSet.filter(({ row, column }) => row > 0 && column > 0, set)
    ).toEqual({
      1: { 1: true },
      2: { 2: true },
    });
  });
});

describe("PointSet.min()", () => {
  test("Returns the point on the minimal row in the minimal column in the set", () => {
    expect(PointSet.min(set)).toEqual({ row: 0, column: 0 });
  });
});
