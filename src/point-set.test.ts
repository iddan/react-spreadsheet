import * as PointSet from "./point-set";
import * as PointRange from "./point-range";
import * as Point from "./point";

const MIN_POINT = Point.ORIGIN;
const MAX_POINT: Point.Point = { row: 2, column: 2 };

const EXAMPLE_SET = PointSet.from([
  MIN_POINT,
  { row: 0, column: 1 },
  { row: 1, column: 1 },
  MAX_POINT,
]);

describe("PointSet.from()", () => {
  test("Creates a new PointSet instance from an array-like or iterable object", () => {
    expect(EXAMPLE_SET).toEqual({
      0: { 0: true, 1: true },
      1: { 1: true },
      2: { 2: true },
    });
  });
});

describe("PointSet.has()", () => {
  test("Returns a boolean asserting whether an point is present with the given value in the Set object or not", () => {
    expect(PointSet.has(EXAMPLE_SET, MAX_POINT)).toBe(true);
  });
});

describe("PointSet.size()", () => {
  test("Returns the number of points in a PointSet object", () => {
    expect(PointSet.size(EXAMPLE_SET)).toBe(4);
  });
});

describe("PointSet.filter()", () => {
  test("Creates a new set with all points that pass the test implemented by the provided function", () => {
    expect(
      PointSet.filter(({ row, column }) => row > 0 && column > 0, EXAMPLE_SET)
    ).toEqual({
      1: { 1: true },
      2: { 2: true },
    });
  });
});

describe("PointSet.min()", () => {
  test("Returns the point on the minimal row in the minimal column in the set", () => {
    expect(PointSet.min(EXAMPLE_SET)).toEqual(MIN_POINT);
  });
});

describe("PointSet.max()", () => {
  test("Returns the point on the maximal row in the maximal column in the set", () => {
    expect(PointSet.max(EXAMPLE_SET)).toEqual(MAX_POINT);
  });
});

describe("PointSet.toRange", () => {
  test("Transforms given set to range", () => {
    expect(PointSet.toRange(EXAMPLE_SET)).toEqual(
      PointRange.create(MIN_POINT, MAX_POINT)
    );
  });
});
