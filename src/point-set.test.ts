import { PointSet } from "./point-set";
import { PointRange } from "./point-range";
import * as Point from "./point";

const MIN_POINT = Point.ORIGIN;
const MAX_POINT: Point.Point = { row: 2, column: 2 };

const EXAMPLE_POINTS = [
  MIN_POINT,
  { row: 0, column: 1 },
  { row: 1, column: 1 },
  MAX_POINT,
];

const EXAMPLE_SET = PointSet.from(EXAMPLE_POINTS);

describe("PointSet.from()", () => {
  test("creates same set for same points", () => {
    expect(EXAMPLE_SET).toEqual(PointSet.from(EXAMPLE_POINTS));
  });
});

describe("PointSet.has()", () => {
  test("Returns a boolean asserting whether an point is present with the given value in the Set object or not", () => {
    expect(EXAMPLE_SET.has(MAX_POINT)).toBe(true);
  });
});

describe("PointSet.size()", () => {
  test("Returns the number of points in a PointSet object", () => {
    expect(EXAMPLE_SET.size()).toBe(4);
  });
});

describe("PointSet.min()", () => {
  test("Returns the point on the minimal row in the minimal column in the set", () => {
    expect(EXAMPLE_SET.min()).toEqual(MIN_POINT);
  });
});

describe("PointSet.max()", () => {
  test("Returns the point on the maximal row in the maximal column in the set", () => {
    expect(EXAMPLE_SET.max()).toEqual(MAX_POINT);
  });
});

describe("PointSet.toRange", () => {
  test("Transforms given set to range", () => {
    expect(EXAMPLE_SET.toRange()).toEqual(new PointRange(MIN_POINT, MAX_POINT));
  });
});

describe("PointSet.subtract", () => {
  test("Subtracts given set from the set", () => {
    expect(
      EXAMPLE_SET.subtract(
        PointSet.from([
          { row: 0, column: 1 },
          { row: 1, column: 1 },
        ])
      )
    ).toEqual(PointSet.from([MIN_POINT, MAX_POINT]));
  });
});

describe("PointSet.values", () => {
  test("Returns an iterator of points in the set", () => {
    expect(Array.from(EXAMPLE_SET.values())).toEqual([
      MIN_POINT,
      { row: 0, column: 1 },
      { row: 1, column: 1 },
      MAX_POINT,
    ]);
  });
});
