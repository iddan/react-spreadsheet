import { PointMap } from "./point-map";
import * as Point from "./point";

const PAIRS: Array<[Point.Point, number]> = [
  [{ row: 0, column: 0 }, 42],
  [{ row: 0, column: 1 }, 42],
  [{ row: 1, column: 1 }, 42],
  [{ row: 2, column: 2 }, 42],
];

const MAP = PointMap.from(PAIRS);

const MATRIX = [
  [42, 42],
  [undefined, 42],
  [undefined, undefined, 42],
];

describe("PointMap.from()", () => {
  test("creates equal map for same pairs", () => {
    expect(MAP).toEqual(PointMap.from(PAIRS));
  });
});

describe("PointMap.get()", () => {
  test("Return value for set point", () => {
    expect(MAP.get(Point.ORIGIN)).toBe(42);
  });
  test("Return undefined for unset point", () => {
    expect(MAP.get({ row: 5, column: 5 })).toBe(undefined);
  });
});

describe("PointMap.set()", () => {
  test("Sets value for point", () => {
    const point = { row: 5, column: 5 };
    const newMap = MAP.set(point, 63);
    expect(newMap.get(point)).toBe(63);
  });
});

describe("PointMap.unset()", () => {
  test("Un-sets point", () => {
    const newMap = MAP.unset(Point.ORIGIN);
    expect(newMap.get(Point.ORIGIN)).toBeUndefined();
  });
  test("Does nothing if point does not exist", () => {
    const point = { row: 5, column: 5 };
    const newMap = MAP.unset(point);
    expect(newMap).toBe(MAP);
  });
});

describe("PointMap.has()", () => {
  test("Returns true for set point", () => {
    expect(MAP.has(Point.ORIGIN)).toBe(true);
  });
  test("Returns false for unset point", () => {
    expect(MAP.has({ row: 5, column: 5 })).toBe(false);
  });
});

describe("PointMap.fromMatrix()", () => {
  test("Creates point map from matrix", () => {
    expect(PointMap.fromMatrix(MATRIX)).toEqual(MAP);
  });
});

describe("PointMap.size()", () => {
  test("Returns correct size", () => {
    expect(MAP.size()).toBe(4);
  });
});
