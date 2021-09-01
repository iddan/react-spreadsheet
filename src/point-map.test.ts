import * as PointMap from "./point-map";
import * as Point from "./point";

const MAP = PointMap.from([
  [{ row: 0, column: 0 }, 42],
  [{ row: 0, column: 1 }, 42],
  [{ row: 1, column: 1 }, 42],
  [{ row: 2, column: 2 }, 42],
]);

const MATRIX = [
  [42, 42],
  [undefined, 42],
  [undefined, undefined, 42],
];

describe("PointMap.from()", () => {
  test("Creates a map from entries", () => {
    expect(MAP).toEqual({
      0: { 0: 42, 1: 42 },
      1: { 1: 42 },
      2: { 2: 42 },
    });
  });
});

describe("PointMap.get()", () => {
  test("Return value for set point", () => {
    expect(PointMap.get(Point.ORIGIN, MAP)).toBe(42);
  });
  test("Return undefined for unset point", () => {
    expect(PointMap.get({ row: 5, column: 5 }, MAP)).toBe(undefined);
  });
});

describe("PointMap.set()", () => {
  test("Sets value for point", () => {
    const point = { row: 5, column: 5 };
    const newMap = PointMap.set(point, 63, MAP);
    expect(PointMap.get(point, newMap)).toBe(63);
  });
});

describe("PointMap.unset()", () => {
  test("Un-sets point", () => {
    const newMap = PointMap.unset(Point.ORIGIN, MAP);
    expect(PointMap.get(Point.ORIGIN, newMap)).toBeUndefined();
  });
  test("Does nothing if point does not exist", () => {
    const point = { row: 5, column: 5 };
    const newMap = PointMap.unset(point, MAP);
    expect(newMap).toBe(MAP);
  });
});

describe("PointMap.has()", () => {
  test("Returns true for set point", () => {
    expect(PointMap.has(Point.ORIGIN, MAP)).toBe(true);
  });
  test("Returns false for unset point", () => {
    expect(PointMap.has({ row: 5, column: 5 }, MAP)).toBe(false);
  });
});

describe("PointMap.getRow()", () => {
  test("Get all the values from a certain row", () => {
    expect(PointMap.getRow(0, MAP)).toEqual([MAP[0][0], MAP[0][1]]);
  });
});

describe("PointMap.getColumn()", () => {
  test("Get all the values from a certain column", () => {
    expect(PointMap.getColumn(0, MAP)).toEqual([MAP[0][0]]);
  });
});

describe("PointMap.fromMatrix()", () => {
  test("Creates point map from matrix", () => {
    expect(PointMap.fromMatrix(MATRIX)).toEqual(MAP);
  });
});

describe("PointMap.size()", () => {
  test("Returns correct size", () => {
    expect(PointMap.size(MAP)).toBe(4);
  });
});

describe("PointMap.reduce()", () => {
  test("Applies a function against an accumulator and each value and point in the map (from left to right) to reduce it to a single value", () => {
    expect(
      PointMap.reduce<Array<[Point.Point, number]>, number>(
        (acc, value, point) => [...acc, [point, value]],
        MAP,
        []
      )
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
    expect(PointMap.map((value) => value + 1, MAP)).toEqual({
      0: { 0: 43, 1: 43 },
      1: { 1: 43 },
      2: { 2: 43 },
    });
  });
});

describe("PointMap.filter()", () => {
  test("Creates a new map of all values predicate returns truthy for. The predicate is invoked with two arguments: (value, key)", () => {
    expect(PointMap.filter((value, point) => point.row > 0, MAP)).toEqual({
      1: { 1: 42 },
      2: { 2: 42 },
    });
  });
});
