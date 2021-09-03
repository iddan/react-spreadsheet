import * as Point from "./point";
import * as PointRange from "./point-range";
import * as Matrix from "./matrix";
import * as Selection from "./selection";

const EXAMPLE_DATA_ROWS_COUNT = 2;
const EXAMPLE_DATA_COLUMNS_COUNT = 2;
const EXAMPLE_DATA = Matrix.createEmpty(
  EXAMPLE_DATA_ROWS_COUNT,
  EXAMPLE_DATA_COLUMNS_COUNT
);
const EXAMPLE_NON_EXISTING_POINT: Point.Point = {
  row: EXAMPLE_DATA_ROWS_COUNT,
  column: EXAMPLE_DATA_COLUMNS_COUNT,
};

describe("Selection.getSelectionFromMatrix()", () => {
  const cases = [
    [
      "Returns null for no selection",
      null,
      EXAMPLE_DATA,
      Matrix.createEmpty(0, 0),
    ],
    [
      "Returns matrix for point range",
      PointRange.create(Point.ORIGIN, { row: 1, column: 1 }),
      EXAMPLE_DATA,
      Matrix.createEmpty(2, 2),
    ],
  ] as const;
  test.each(cases)("%s", (name, selection, data, expected) => {
    expect(Selection.getSelectionFromMatrix(selection, data)).toEqual(expected);
  });
});

describe("Selection.normalize()", () => {
  test("Normalizes given selected range to given data", () => {
    const EXAMPLE_RANGE = PointRange.create(Point.ORIGIN, {
      row: EXAMPLE_DATA_ROWS_COUNT,
      column: EXAMPLE_DATA_COLUMNS_COUNT,
    });
    expect(Selection.normalize(EXAMPLE_RANGE, EXAMPLE_DATA)).toEqual(
      PointRange.create(Point.ORIGIN, Matrix.maxPoint(EXAMPLE_DATA))
    );
  });
});

describe("Selection.getPoints()", () => {
  const cases = [
    ["Returns empty for non-range", null, []],
    [
      "Returns points for range",
      PointRange.create(Point.ORIGIN, Point.ORIGIN),
      [Point.ORIGIN],
    ],
  ] as const;
  test.each(cases)("%s", (name, selected, expected) => {
    expect(Selection.getPoints(selected)).toEqual(expected);
  });
});

describe("Selection.has()", () => {
  const cases = [
    [
      "in range",
      Point.ORIGIN,
      PointRange.create(Point.ORIGIN, Point.ORIGIN),
      true,
    ],
    [
      "not selected",
      EXAMPLE_NON_EXISTING_POINT,
      PointRange.create(Point.ORIGIN, Point.ORIGIN),
      false,
    ],
  ] as const;
  test.each(cases)("%s", (name, point, selected, expected) => {
    expect(Selection.has(selected, point)).toBe(expected);
  });
});

describe("Selection.modifyEdge()", () => {
  const cases = [
    [
      "modify left",
      PointRange.create({ row: 0, column: 1 }, { row: 0, column: 1 }),
      { row: 0, column: 1 },
      EXAMPLE_DATA,
      Selection.Direction.Left,
      PointRange.create(Point.ORIGIN, { row: 0, column: 1 }),
    ],
    [
      "modify left, blocked",
      PointRange.create(Point.ORIGIN, Point.ORIGIN),
      Point.ORIGIN,
      EXAMPLE_DATA,
      Selection.Direction.Left,
      PointRange.create(Point.ORIGIN, Point.ORIGIN),
    ],
    [
      "modify left, backwards",
      PointRange.create(Point.ORIGIN, { row: 0, column: 1 }),
      Point.ORIGIN,
      EXAMPLE_DATA,
      Selection.Direction.Left,
      PointRange.create(Point.ORIGIN, Point.ORIGIN),
    ],
    [
      "modify right",
      PointRange.create(Point.ORIGIN, Point.ORIGIN),
      Point.ORIGIN,
      EXAMPLE_DATA,
      Selection.Direction.Right,
      PointRange.create(Point.ORIGIN, { row: 0, column: 1 }),
    ],
    [
      "modify right, blocked",
      PointRange.create({ row: 0, column: 1 }, { row: 0, column: 1 }),
      Point.ORIGIN,
      EXAMPLE_DATA,
      Selection.Direction.Right,
      PointRange.create({ row: 0, column: 1 }, { row: 0, column: 1 }),
    ],
    [
      "modify right, backwards",
      PointRange.create(Point.ORIGIN, { row: 0, column: 1 }),
      { row: 0, column: 1 },
      EXAMPLE_DATA,
      Selection.Direction.Right,
      PointRange.create({ row: 0, column: 1 }, { row: 0, column: 1 }),
    ],
    [
      "modify top",
      PointRange.create({ row: 1, column: 0 }, { row: 1, column: 0 }),
      { row: 1, column: 0 },
      EXAMPLE_DATA,
      Selection.Direction.Top,
      PointRange.create(Point.ORIGIN, { row: 1, column: 0 }),
    ],
    [
      "modify top, blocked",
      PointRange.create(Point.ORIGIN, Point.ORIGIN),
      Point.ORIGIN,
      EXAMPLE_DATA,
      Selection.Direction.Top,
      PointRange.create(Point.ORIGIN, Point.ORIGIN),
    ],
    [
      "modify top, backwards",
      PointRange.create(Point.ORIGIN, { row: 1, column: 0 }),
      Point.ORIGIN,
      EXAMPLE_DATA,
      Selection.Direction.Top,
      PointRange.create(Point.ORIGIN, Point.ORIGIN),
    ],
    [
      "modify bottom",
      PointRange.create(Point.ORIGIN, Point.ORIGIN),
      Point.ORIGIN,
      EXAMPLE_DATA,
      Selection.Direction.Bottom,
      PointRange.create(Point.ORIGIN, { row: 1, column: 0 }),
    ],
    [
      "modify bottom, blocked",
      PointRange.create({ row: 1, column: 0 }, { row: 1, column: 0 }),
      { row: 1, column: 0 },
      EXAMPLE_DATA,
      Selection.Direction.Bottom,
      PointRange.create({ row: 1, column: 0 }, { row: 1, column: 0 }),
    ],
    [
      "modify bottom, backwards",
      PointRange.create(Point.ORIGIN, { row: 1, column: 0 }),
      { row: 1, column: 0 },
      EXAMPLE_DATA,
      Selection.Direction.Bottom,
      PointRange.create({ row: 1, column: 0 }, { row: 1, column: 0 }),
    ],
    [
      "does nothing if no active and selection",
      null,
      null,
      EXAMPLE_DATA,
      Selection.Direction.Left,
      null,
    ],
  ] as const;
  test.each(cases)("%s", (name, selection, active, data, edge, expected) => {
    expect(Selection.modifyEdge(selection, active, data, edge)).toEqual(
      expected
    );
  });
});

describe("Selection.size()", () => {
  const cases = [
    ["point range", PointRange.create(Point.ORIGIN, Point.ORIGIN), 1],
    ["no selection", null, 0],
  ] as const;
  test.each(cases)("%s", (name, selection, expected) => {
    expect(Selection.size(selection)).toBe(expected);
  });
});

describe("Selection.getMatrixRange()", () => {
  test("Returns the point range of given matrix", () => {
    expect(Selection.getMatrixRange(EXAMPLE_DATA)).toEqual(
      PointRange.create(Point.ORIGIN, {
        row: EXAMPLE_DATA_COLUMNS_COUNT - 1,
        column: EXAMPLE_DATA_ROWS_COUNT - 1,
      })
    );
  });
});
