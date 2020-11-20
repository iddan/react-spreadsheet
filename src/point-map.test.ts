import * as PointMap from "./point-map";

const map = PointMap.from([
  [{ row: 0, column: 0 }, 42],
  [{ row: 0, column: 1 }, 42],
  [{ row: 1, column: 1 }, 42],
  [{ row: 2, column: 2 }, 42],
]);

describe("PointMap.from()", () => {
  test("Creates a map from entries", () => {
    expect(map).toEqual({
      0: { 0: 42, 1: 42 },
      1: { 1: 42 },
      2: { 2: 42 },
    });
  });
});

describe("PointMap.get()", () => {
  test("Return value for set point", () => {
    expect(PointMap.get({ row: 0, column: 0 }, map)).toBe(42);
  });
  test("Return undefined for unset point", () => {
    expect(PointMap.get({ row: 5, column: 5 }, map)).toBe(undefined);
  });
});

describe("PointMap.set()", () => {
  test("Sets value for point", () => {
    const newMap = PointMap.set({ row: 5, column: 5 }, 63, map);
    expect(PointMap.get({ row: 5, column: 5 }, newMap)).toBe(63);
  });
});

describe("PointMap.has()", () => {
  test("Returns true for set point", () => {
    expect(PointMap.has({ row: 0, column: 0 }, map)).toBe(true);
  });
  test("Returns false for unset point", () => {
    expect(PointMap.has({ row: 5, column: 5 }, map)).toBe(false);
  });
});

describe("PointMap.size()", () => {
  test("Returns correct size", () => {
    expect(PointMap.size(map)).toBe(4);
  });
});

describe("PointMap.reduce()", () => {
  test("Applies a function against an accumulator and each value and point in the map (from left to right) to reduce it to a single value", () => {
    expect(
      PointMap.reduce((acc, value, point) => [...acc, [point, value]], map, [])
    ).toEqual([
      [{ row: 0, column: 0 }, 42],
      [{ row: 0, column: 1 }, 42],
      [{ row: 1, column: 1 }, 42],
      [{ row: 2, column: 2 }, 42],
    ]);
  });
});

describe("PointMap.map()", () => {
  test("Creates a new map with the results of calling a provided function on every value in the calling map", () => {
    expect(PointMap.map((value) => value + 1, map)).toEqual({
      0: { 0: 43, 1: 43 },
      1: { 1: 43 },
      2: { 2: 43 },
    });
  });
});

describe("PointMap.filter()", () => {
  test("Creates a new map of all values predicate returns truthy for. The predicate is invoked with two arguments: (value, key)", () => {
    expect(PointMap.filter((value, point) => point.row > 0, map)).toEqual({
      1: { 1: 42 },
      2: { 2: 42 },
    });
  });
});
