import * as PointSet from "./point-set";
import { Point } from "./types";

const SET = PointSet.from([
  { row: 0, column: 0 },
  { row: 0, column: 1 },
  { row: 1, column: 1 },
  { row: 2, column: 2 },
]);

const NON_SPARSE_SET = PointSet.from([
  { row: 0, column: 0 },
  { row: 0, column: 1 },
  { row: 1, column: 0 },
  { row: 1, column: 1 },
]);

const EMPTY_SET = PointSet.from([]);

describe("PointSet.from()", () => {
  test("Creates a new PointSet instance from an array-like or iterable object", () => {
    expect(SET).toEqual({
      0: { 0: true, 1: true },
      1: { 1: true },
      2: { 2: true },
    });
  });
});

describe("PointSet.add()", () => {
  test("Appends a new point to the Set object", () => {
    expect(PointSet.add(SET, { row: 3, column: 3 })).toEqual({
      0: { 0: true, 1: true },
      1: { 1: true },
      2: { 2: true },
      3: { 3: true },
    });
  });
});

describe("PointSet.remove()", () => {
  test("Removes the point from the Set object", () => {
    expect(PointSet.remove(SET, { row: 2, column: 2 })).toEqual({
      0: { 0: true, 1: true },
      1: { 1: true },
    });
  });
});

describe("PointSet.has()", () => {
  test("Returns a boolean asserting whether an point is present with the given value in the Set object or not", () => {
    expect(PointSet.has(SET, { row: 2, column: 2 })).toBe(true);
  });
});

describe("PointSet.size()", () => {
  test("Returns the number of points in a PointSet object", () => {
    expect(PointSet.size(SET)).toBe(4);
  });
});

describe("PointSet.reduce()", () => {
  test("Applies a function against an accumulator and each point in the set (from left to right) to reduce it to a single value", () => {
    expect(
      PointSet.reduce((acc, point) => [...acc, point], SET, [] as Point[])
    ).toEqual([
      { row: 0, column: 0 },
      { row: 0, column: 1 },
      { row: 1, column: 1 },
      { row: 2, column: 2 },
    ]);
  });
});

describe("PointSet.map()", () => {
  test("Creates a new set with the results of calling a provided function on every point in the calling set", () => {
    expect(
      PointSet.map(
        ({ row, column }) => ({ row: row + 1, column: column + 1 }),
        SET
      )
    ).toEqual({
      1: { 1: true, 2: true },
      2: { 2: true },
      3: { 3: true },
    });
  });
});

describe("PointSet.filter()", () => {
  test("Creates a new set with all points that pass the test implemented by the provided function", () => {
    expect(
      PointSet.filter(({ row, column }) => row > 0 && column > 0, SET)
    ).toEqual({
      1: { 1: true },
      2: { 2: true },
    });
  });
});

describe("PointSet.min()", () => {
  test("Returns the point on the minimal row in the minimal column in the set", () => {
    expect(PointSet.min(SET)).toEqual({ row: 0, column: 0 });
  });
});

describe("PointSet.isEmpty()", () => {
  test("Returns whether set has any points in", () => {
    expect(PointSet.isEmpty(PointSet.from([]))).toEqual(true);
    expect(PointSet.isEmpty(SET)).toEqual(false);
  });
});

describe("PointSet.toArray()", () => {
  test("Returns an array of the set points", () => {
    expect(PointSet.toArray(SET)).toEqual([
      { row: 0, column: 0 },
      { row: 0, column: 1 },
      { row: 1, column: 1 },
      { row: 2, column: 2 },
    ]);
  });
});

describe("PointSet.onEdge()", () => {
  const cases = [
    [{ row: 0, column: 0 }, PointSet.Edge.Left, true],
    [{ row: 0, column: 0 }, PointSet.Edge.Top, true],
    [{ row: 0, column: 0 }, PointSet.Edge.Right, false],
    [{ row: 0, column: 0 }, PointSet.Edge.Bottom, false],
    [{ row: 0, column: 1 }, PointSet.Edge.Right, true],
    [{ row: 1, column: 0 }, PointSet.Edge.Bottom, true],
  ] as const;
  test.each(cases)(
    "PointSet.onEdge(NON_SPARSE_SET, %p, %p) === %p",
    (point, edge, expected) => {
      expect(PointSet.onEdge(NON_SPARSE_SET, point, edge)).toEqual(expected);
    }
  );
});

describe("PointSet.onEdges()", () => {
  test("Returns whether point is on the edges of a set", () => {
    expect(PointSet.onEdges(NON_SPARSE_SET, { row: 0, column: 0 })).toEqual({
      left: true,
      right: false,
      top: true,
      bottom: false,
    });
  });
  test("Returns no edges if point is not in the set", () => {
    expect(PointSet.onEdges(NON_SPARSE_SET, { row: 5, column: 5 })).toEqual({
      left: false,
      right: false,
      top: false,
      bottom: false,
    });
  });
});

describe("PointSet.extendEdge()", () => {
  test("Extends the given edge of the given set by given delta", () => {
    expect(PointSet.extendEdge(NON_SPARSE_SET, PointSet.Edge.Right, 1)).toEqual(
      PointSet.from([
        { row: 0, column: 0 },
        { row: 0, column: 1 },
        { row: 0, column: 2 },
        { row: 1, column: 0 },
        { row: 1, column: 1 },
        { row: 1, column: 2 },
      ])
    );
  });
});

describe("PointSet.shrinkEdge()", () => {
  test("Shrinks the given edge of the given set by given delta", () => {
    expect(PointSet.shrinkEdge(NON_SPARSE_SET, PointSet.Edge.Right, 1)).toEqual(
      PointSet.from([
        { row: 0, column: 0 },
        { row: 1, column: 0 },
      ])
    );
  });
  test("Does nothing if set is empty", () => {
    expect(PointSet.shrinkEdge(EMPTY_SET, PointSet.Edge.Right, 1)).toBe(
      EMPTY_SET
    );
  });
});

describe("PointSet.max()", () => {
  test("Returns the point on the maximal row in the maximal column in the set", () => {
    expect(PointSet.max(SET)).toEqual({ row: 2, column: 2 });
  });
  test("Returns null for an empty set", () => {
    expect(PointSet.max(EMPTY_SET)).toBe(null);
  });
});
