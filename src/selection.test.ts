import * as Point from "./point";
import * as PointRange from "./point-range";
import * as Matrix from "./matrix";
import * as Selection from "./selection";

const EXAMPLE_DATA_ROWS_COUNT = 4;
const EXAMPLE_DATA_COLUMNS_COUNT = 4;
const EXAMPLE_DATA = Matrix.createEmpty(
  EXAMPLE_DATA_ROWS_COUNT,
  EXAMPLE_DATA_COLUMNS_COUNT
);
const EXAMPLE_DATA_MAX_POINT = Matrix.maxPoint(EXAMPLE_DATA);
const EXAMPLE_NON_EXISTING_POINT: Point.Point = {
  row: EXAMPLE_DATA_ROWS_COUNT,
  column: EXAMPLE_DATA_COLUMNS_COUNT,
};

describe("Selection.createEntireRows()", () => {
  test("creates entire rows selection", () => {
    const start = 0;
    const end = 0;
    expect(Selection.createEntireRows(start, end)).toEqual({
      type: Selection.EntireType.Row,
      start,
      end,
    });
  });
  test("throws for invalid start", () => {
    expect(() => Selection.createEntireRows(-1, 0)).toThrow(
      new Selection.InvalidIndexError("start")
    );
  });
  test("throws for invalid end", () => {
    expect(() => Selection.createEntireRows(0, -1)).toThrow(
      new Selection.InvalidIndexError("end")
    );
  });
});

describe("Selection.createEntireColumns()", () => {
  test("creates entire columns selection", () => {
    const start = 0;
    const end = 0;
    expect(Selection.createEntireColumns(start, end)).toEqual({
      type: Selection.EntireType.Column,
      start,
      end,
    });
  });
  test("throws for invalid start", () => {
    expect(() => Selection.createEntireColumns(-1, 0)).toThrow(
      new Selection.InvalidIndexError("start")
    );
  });
  test("throws for invalid end", () => {
    expect(() => Selection.createEntireColumns(0, -1)).toThrow(
      new Selection.InvalidIndexError("end")
    );
  });
});

describe("Selection.createEntireTable()", () => {
  test("creates entire table selection", () => {
    expect(Selection.createEntireTable()).toEqual({
      type: Selection.EntireType.Table,
    });
  });
});

describe("isEntireRows()", () => {
  test.each([
    ["entire rows", Selection.createEntireRows(0, 0), true],
    ["null", null, false],
  ] as const)("%s", (name, value, expected) => {
    expect(Selection.isEntireRows(value)).toBe(expected);
  });
});

describe("isEntireColumns()", () => {
  test.each([
    ["entire columns", Selection.createEntireColumns(0, 0), true],
    ["null", null, false],
  ] as const)("%s", (name, value, expected) => {
    expect(Selection.isEntireColumns(value)).toBe(expected);
  });
});

describe("isEntireTable()", () => {
  test.each([
    ["entire table", Selection.createEntireTable(), true],
    ["null", null, false],
  ] as const)("%s", (name, value, expected) => {
    expect(Selection.isEntireTable(value)).toBe(expected);
  });
});

describe("Selection.toRange()", () => {
  const cases = [
    ["null", null, EXAMPLE_DATA, null],
    [
      "range",
      PointRange.create(Point.ORIGIN, Point.ORIGIN),
      EXAMPLE_DATA,
      PointRange.create(Point.ORIGIN, Point.ORIGIN),
    ],
    [
      "entire rows",
      Selection.createEntireRows(1, 2),
      EXAMPLE_DATA,
      PointRange.create(
        { row: 1, column: 0 },
        { row: 2, column: EXAMPLE_DATA_MAX_POINT.column }
      ),
    ],
    [
      "entire columns",
      { type: Selection.EntireType.Column, start: 1, end: 2 },
      EXAMPLE_DATA,
      PointRange.create(
        { row: 0, column: 1 },
        { row: EXAMPLE_DATA_MAX_POINT.row, column: 2 }
      ),
    ],
    [
      "entire table",
      { type: Selection.EntireType.Table },
      EXAMPLE_DATA,
      Selection.getMatrixRange(EXAMPLE_DATA),
    ],
  ] as const;
  test.each(cases)("%s", (name, selection, data, expected) => {
    expect(Selection.toRange(selection, data)).toEqual(expected);
  });
});

describe("Selection.getSelectionFromMatrix()", () => {
  const cases = [
    [
      "Returns null for no selection",
      null,
      EXAMPLE_DATA,
      Matrix.createEmpty(0, 0),
    ],
    [
      "Returns matrix for selection",
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
  const cases = [
    [
      "Normalizes given selection range to given data",
      PointRange.create(Point.ORIGIN, {
        row: EXAMPLE_DATA_ROWS_COUNT,
        column: EXAMPLE_DATA_COLUMNS_COUNT,
      }),
      PointRange.create(Point.ORIGIN, Matrix.maxPoint(EXAMPLE_DATA)),
    ],
    [
      "Normalizes entire rows selection to given data",
      Selection.createEntireRows(0, EXAMPLE_DATA_ROWS_COUNT),
      Selection.createEntireRows(0, EXAMPLE_DATA_ROWS_COUNT - 1),
    ],
    [
      "Normalizes entire columns selection to given data",
      Selection.createEntireColumns(0, EXAMPLE_DATA_COLUMNS_COUNT),
      Selection.createEntireColumns(0, EXAMPLE_DATA_COLUMNS_COUNT - 1),
    ],
    ["Does nothing for non-range selection", null, null],
  ] as const;
  test.each(cases)("%s", (name, selection, expected) => {
    expect(Selection.normalize(selection, EXAMPLE_DATA)).toEqual(expected);
  });
});

describe("Selection.normalizeRange()", () => {
  const cases = [
    [
      "Normalizes given selection range to given data",
      PointRange.create(Point.ORIGIN, {
        row: EXAMPLE_DATA_ROWS_COUNT,
        column: EXAMPLE_DATA_COLUMNS_COUNT,
      }),
      PointRange.create(Point.ORIGIN, Matrix.maxPoint(EXAMPLE_DATA)),
    ],
  ] as const;
  test.each(cases)("%s", (name, selection, expected) => {
    expect(Selection.normalizeRange(selection, EXAMPLE_DATA)).toEqual(expected);
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
    expect(Selection.getPoints(selected, EXAMPLE_DATA)).toEqual(expected);
  });
});

describe("Selection.hasPoint()", () => {
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
    expect(Selection.hasPoint(selected, EXAMPLE_DATA, point)).toBe(expected);
  });
});

describe("Selection.modifyEdge()", () => {
  const cases = [
    [
      "modifies range",
      PointRange.create(Point.ORIGIN, Point.ORIGIN),
      Point.ORIGIN,
      EXAMPLE_DATA,
      Selection.Direction.Right,
      PointRange.create(Point.ORIGIN, { row: 0, column: 1 }),
    ],
    [
      "modifies entire rows",
      Selection.createEntireRows(0, 0),
      Point.ORIGIN,
      EXAMPLE_DATA,
      Selection.Direction.Bottom,
      Selection.createEntireRows(0, 1),
    ],
    [
      "modifies entire columns",
      Selection.createEntireColumns(0, 0),
      Point.ORIGIN,
      EXAMPLE_DATA,
      Selection.Direction.Right,
      Selection.createEntireColumns(0, 1),
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

describe("Selection.modifyPointRangeEdge()", () => {
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
      PointRange.create(EXAMPLE_DATA_MAX_POINT, EXAMPLE_DATA_MAX_POINT),
      EXAMPLE_DATA_MAX_POINT,
      EXAMPLE_DATA,
      Selection.Direction.Right,
      PointRange.create(EXAMPLE_DATA_MAX_POINT, EXAMPLE_DATA_MAX_POINT),
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
      PointRange.create(EXAMPLE_DATA_MAX_POINT, EXAMPLE_DATA_MAX_POINT),
      EXAMPLE_DATA_MAX_POINT,
      EXAMPLE_DATA,
      Selection.Direction.Bottom,
      PointRange.create(EXAMPLE_DATA_MAX_POINT, EXAMPLE_DATA_MAX_POINT),
    ],
    [
      "modify bottom, backwards",
      PointRange.create(Point.ORIGIN, { row: 1, column: 0 }),
      { row: 1, column: 0 },
      EXAMPLE_DATA,
      Selection.Direction.Bottom,
      PointRange.create({ row: 1, column: 0 }, { row: 1, column: 0 }),
    ],
  ] as const;
  test.each(cases)("%s", (name, selection, active, data, edge, expected) => {
    expect(Selection.modifyRangeEdge(selection, active, data, edge)).toEqual(
      expected
    );
  });
});

describe("Selection.modifyEntireRowsEdge()", () => {
  const cases = [
    [
      "modify left",
      Selection.createEntireRows(0, 0),
      { row: 0, column: 1 },
      EXAMPLE_DATA,
      Selection.Direction.Left,
      Selection.createEntireRows(0, 0),
    ],
    [
      "modify right",
      Selection.createEntireRows(0, 0),
      Point.ORIGIN,
      EXAMPLE_DATA,
      Selection.Direction.Right,
      Selection.createEntireRows(0, 0),
    ],
    [
      "modify top",
      Selection.createEntireRows(1, 1),
      { row: 1, column: 0 },
      EXAMPLE_DATA,
      Selection.Direction.Top,
      Selection.createEntireRows(0, 1),
    ],
    [
      "modify top, blocked",
      Selection.createEntireRows(0, 0),
      Point.ORIGIN,
      EXAMPLE_DATA,
      Selection.Direction.Top,
      Selection.createEntireRows(0, 0),
    ],
    [
      "modify top, backwards",
      Selection.createEntireRows(0, 1),
      Point.ORIGIN,
      EXAMPLE_DATA,
      Selection.Direction.Top,
      Selection.createEntireRows(0, 0),
    ],
    [
      "modify bottom",
      Selection.createEntireRows(0, 0),
      Point.ORIGIN,
      EXAMPLE_DATA,
      Selection.Direction.Bottom,
      Selection.createEntireRows(0, 1),
    ],
    [
      "modify bottom, blocked",
      Selection.createEntireRows(
        EXAMPLE_DATA_MAX_POINT.row,
        EXAMPLE_DATA_MAX_POINT.row
      ),
      EXAMPLE_DATA_MAX_POINT,
      EXAMPLE_DATA,
      Selection.Direction.Bottom,
      Selection.createEntireRows(
        EXAMPLE_DATA_MAX_POINT.row,
        EXAMPLE_DATA_MAX_POINT.row
      ),
    ],
    [
      "modify bottom, backwards",
      Selection.createEntireRows(0, 1),
      { row: 1, column: 0 },
      EXAMPLE_DATA,
      Selection.Direction.Bottom,
      Selection.createEntireRows(1, 1),
    ],
  ] as const;
  test.each(cases)("%s", (name, selection, active, data, edge, expected) => {
    expect(
      Selection.modifyEntireRowsEdge(selection, active, data, edge)
    ).toEqual(expected);
  });
});

describe("Selection.modifyEntireColumnsEdge()", () => {
  const cases = [
    [
      "modify top",
      Selection.createEntireColumns(0, 0),
      { row: 1, column: 0 },
      EXAMPLE_DATA,
      Selection.Direction.Top,
      Selection.createEntireColumns(0, 0),
    ],
    [
      "modify bottom",
      Selection.createEntireColumns(0, 0),
      Point.ORIGIN,
      EXAMPLE_DATA,
      Selection.Direction.Bottom,
      Selection.createEntireColumns(0, 0),
    ],
    [
      "modify left",
      Selection.createEntireColumns(1, 1),
      { row: 0, column: 1 },
      EXAMPLE_DATA,
      Selection.Direction.Left,
      Selection.createEntireColumns(0, 1),
    ],
    [
      "modify left, blocked",
      Selection.createEntireColumns(0, 0),
      Point.ORIGIN,
      EXAMPLE_DATA,
      Selection.Direction.Left,
      Selection.createEntireColumns(0, 0),
    ],
    [
      "modify left, backwards",
      Selection.createEntireColumns(0, 1),
      Point.ORIGIN,
      EXAMPLE_DATA,
      Selection.Direction.Left,
      Selection.createEntireColumns(0, 0),
    ],
    [
      "modify right",
      Selection.createEntireColumns(0, 0),
      Point.ORIGIN,
      EXAMPLE_DATA,
      Selection.Direction.Right,
      Selection.createEntireColumns(0, 1),
    ],
    [
      "modify right, blocked",
      Selection.createEntireColumns(
        EXAMPLE_DATA_MAX_POINT.row,
        EXAMPLE_DATA_MAX_POINT.row
      ),
      EXAMPLE_DATA_MAX_POINT,
      EXAMPLE_DATA,
      Selection.Direction.Right,
      Selection.createEntireColumns(
        EXAMPLE_DATA_MAX_POINT.row,
        EXAMPLE_DATA_MAX_POINT.row
      ),
    ],
    [
      "modify right, backwards",
      Selection.createEntireColumns(0, 1),
      { row: 0, column: 1 },
      EXAMPLE_DATA,
      Selection.Direction.Right,
      Selection.createEntireColumns(1, 1),
    ],
  ] as const;
  test.each(cases)("%s", (name, selection, active, data, edge, expected) => {
    expect(
      Selection.modifyEntireColumnsEdge(selection, active, data, edge)
    ).toEqual(expected);
  });
});

describe("Selection.size()", () => {
  const cases = [
    ["defined selection", PointRange.create(Point.ORIGIN, Point.ORIGIN), 1],
    ["no selection", null, 0],
  ] as const;
  test.each(cases)("%s", (name, selection, expected) => {
    expect(Selection.size(selection, EXAMPLE_DATA)).toBe(expected);
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

describe("Selection.hasEntireRow()", () => {
  const cases = [
    [
      "returns true for entire row in selection",
      Selection.createEntireRows(0, 0),
      0,
      true,
    ],
    [
      "returns false for row not in entire row selection",
      Selection.createEntireRows(0, 0),
      1,
      false,
    ],
    ["returns false for non-entire-rows selection", null, 0, false],
  ] as const;
  test.each(cases)("%s", (name, selection, row, expected) => {
    expect(Selection.hasEntireRow(selection, row)).toBe(expected);
  });
});

describe("Selection.hasEntireColumn()", () => {
  const cases = [
    [
      "returns true for entire column in selection",
      Selection.createEntireColumns(0, 0),
      0,
      true,
    ],
    [
      "returns false for column not in entire column selection",
      Selection.createEntireColumns(0, 0),
      1,
      false,
    ],
    ["returns false for non-entire-columns selection", null, 0, false],
  ] as const;
  test.each(cases)("%s", (name, selection, column, expected) => {
    expect(Selection.hasEntireColumn(selection, column)).toBe(expected);
  });
});

describe("isIndex", () => {
  const cases = [
    ["returns true for a valid index", 0, true],
    ["returns false for non integer", 0.1, false],
    ["returns false for a negative integer", -1, false],
  ] as const;
  test.each(cases)("%s", (name, value, expected) => {
    expect(Selection.isIndex(value)).toEqual(expected);
  });
});
