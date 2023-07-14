import { PointSet } from "./point-set";
import * as Point from "./point";

const MIN_POINT = Point.ORIGIN;
const MAX_POINT: Point.Point = { row: 2, column: 2 };

const EXAMPLE_POINTS: Point.Point[] = [
  MIN_POINT,
  { row: 0, column: 1 },
  { row: 1, column: 1 },
  MAX_POINT,
];

const EXAMPLE_SET = PointSet.from(EXAMPLE_POINTS);

describe("PointSet.prototype.from()", () => {
  test("creates same set for same points", () => {
    expect(EXAMPLE_SET).toEqual(PointSet.from(EXAMPLE_POINTS));
  });
});

describe("PointSet.prototype.has()", () => {
  test("Returns a boolean asserting whether an point is present with the given value in the Set object or not", () => {
    expect(EXAMPLE_SET.has(MAX_POINT)).toBe(true);
  });
});

describe("PointSet.prototype.size()", () => {
  test("Returns the number of points in a PointSet object", () => {
    expect(EXAMPLE_SET.size()).toBe(EXAMPLE_POINTS.length);
  });
});

describe("PointSet.prototype.difference()", () => {
  test("Subtracts given other set from the set", () => {
    expect(
      EXAMPLE_SET.difference(
        PointSet.from([
          { row: 0, column: 1 },
          { row: 1, column: 1 },
        ])
      )
    ).toEqual(PointSet.from([MIN_POINT, MAX_POINT]));
  });
});

describe("PointSet iterator", () => {
  test("Returns an iterator of points in the set", () => {
    expect(Array.from(EXAMPLE_SET)).toEqual(EXAMPLE_POINTS);
  });
});
