import * as Point from "./point";
import { PointRange } from "./point-range";
import * as Matrix from "./matrix";
import {
  Selection,
  EmptySelection,
  RangeSelection,
  EntireColumnsSelection,
  EntireRowsSelection,
  EntireWorksheetSelection,
  InvalidIndexError,
  isIndex,
  getMatrixRange,
} from "./selection";

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

describe("new EntireRowsSelection()", () => {
  test("creates entire rows selection", () => {
    const start = 0;
    const end = 0;
    new EntireRowsSelection(start, end);
  });
  test("throws for invalid start", () => {
    expect(() => new EntireRowsSelection(-1, 0)).toThrow(
      new InvalidIndexError("start")
    );
  });
  test("throws for invalid end", () => {
    expect(() => new EntireRowsSelection(0, -1)).toThrow(
      new InvalidIndexError("end")
    );
  });
});

describe("new EntireColumnsSelection()", () => {
  test("creates entire columns selection", () => {
    const start = 0;
    const end = 0;
    new EntireColumnsSelection(start, end);
  });
  test("throws for invalid start", () => {
    expect(() => new EntireColumnsSelection(-1, 0)).toThrow(
      new InvalidIndexError("start")
    );
  });
  test("throws for invalid end", () => {
    expect(() => new EntireColumnsSelection(0, -1)).toThrow(
      new InvalidIndexError("end")
    );
  });
});

describe("EntireWorksheetSelection", () => {
  test("creates entire worksheet selection", () => {
    new EntireWorksheetSelection();
  });
  test("toRange() returns the range of entire worksheet", () => {
    const selection = new EntireWorksheetSelection();
    expect(selection.toRange(EXAMPLE_DATA)).toEqual(
      getMatrixRange(EXAMPLE_DATA)
    );
  });
  test("normalizeTo() returns the same object", () => {
    const selection = new EntireWorksheetSelection();
    expect(selection.normalizeTo(EXAMPLE_DATA)).toEqual(selection);
  });
  test("hasEntireRow() returns true for any row", () => {
    const selection = new EntireWorksheetSelection();
    expect(selection.hasEntireRow(0)).toBe(true);
    expect(selection.hasEntireRow(1)).toBe(true);
  });
  test("hasEntireColumn() returns true for any column", () => {
    const selection = new EntireWorksheetSelection();
    expect(selection.hasEntireColumn(0)).toBe(true);
    expect(selection.hasEntireColumn(1)).toBe(true);
  });
  test("size() returns the size of entire worksheet", () => {
    const selection = new EntireWorksheetSelection();
    expect(selection.size(EXAMPLE_DATA)).toBe(
      EXAMPLE_DATA_ROWS_COUNT * EXAMPLE_DATA_COLUMNS_COUNT
    );
  });
  test("has() returns true for any point", () => {
    const selection = new EntireWorksheetSelection();
    expect(selection.has(EXAMPLE_DATA, Point.ORIGIN)).toBe(true);
    expect(selection.has(EXAMPLE_DATA, EXAMPLE_DATA_MAX_POINT)).toBe(true);
  });
});

describe("Selection.prototype.toRange()", () => {
  const cases: Array<
    [
      name: string,
      selection: Selection,
      data: Matrix.Matrix<unknown>,
      expected: PointRange | null
    ]
  > = [
    ["empty", new EmptySelection(), EXAMPLE_DATA, null],
    [
      "range",
      new RangeSelection(new PointRange(Point.ORIGIN, Point.ORIGIN)),
      EXAMPLE_DATA,
      new PointRange(Point.ORIGIN, Point.ORIGIN),
    ],
    [
      "entire rows",
      new EntireRowsSelection(1, 2),
      EXAMPLE_DATA,
      new PointRange(
        { row: 1, column: 0 },
        { row: 2, column: EXAMPLE_DATA_MAX_POINT.column }
      ),
    ],
    [
      "entire columns",
      new EntireColumnsSelection(1, 2),
      EXAMPLE_DATA,
      new PointRange(
        { row: 0, column: 1 },
        { row: EXAMPLE_DATA_MAX_POINT.row, column: 2 }
      ),
    ],
    [
      "entire worksheet",
      new EntireWorksheetSelection(),
      EXAMPLE_DATA,
      getMatrixRange(EXAMPLE_DATA),
    ],
  ];
  test.each(cases)("%s", (name, selection, data, expected) => {
    expect(selection.toRange(data)).toEqual(expected);
  });
});

describe("Selection.prototype.normalize()", () => {
  const cases: Array<
    [name: string, selection: Selection, expected: Selection]
  > = [
    [
      "Normalizes given selection range to given data",
      new RangeSelection(
        new PointRange(Point.ORIGIN, {
          row: EXAMPLE_DATA_ROWS_COUNT,
          column: EXAMPLE_DATA_COLUMNS_COUNT,
        })
      ),
      new RangeSelection(
        new PointRange(Point.ORIGIN, Matrix.maxPoint(EXAMPLE_DATA))
      ),
    ],
    [
      "Normalizes entire rows selection to given data",
      new EntireRowsSelection(0, EXAMPLE_DATA_ROWS_COUNT),
      new EntireRowsSelection(0, EXAMPLE_DATA_ROWS_COUNT - 1),
    ],
    [
      "Normalizes entire columns selection to given data",
      new EntireColumnsSelection(0, EXAMPLE_DATA_COLUMNS_COUNT),
      new EntireColumnsSelection(0, EXAMPLE_DATA_COLUMNS_COUNT - 1),
    ],
    [
      "Does nothing for non-range selection",
      new EmptySelection(),
      new EmptySelection(),
    ],
  ];
  test.each(cases)("%s", (name, selection, expected) => {
    expect(selection.normalizeTo(EXAMPLE_DATA)).toEqual(expected);
  });
});

describe("RangeSelection.normalizeTo()", () => {
  const cases: Array<
    [name: string, selection: RangeSelection, expected: RangeSelection]
  > = [
    [
      "Normalizes given selection range to given data",
      new RangeSelection(
        new PointRange(Point.ORIGIN, {
          row: EXAMPLE_DATA_ROWS_COUNT,
          column: EXAMPLE_DATA_COLUMNS_COUNT,
        })
      ),
      new RangeSelection(
        new PointRange(Point.ORIGIN, Matrix.maxPoint(EXAMPLE_DATA))
      ),
    ],
  ];
  test.each(cases)("%s", (name, selection, expected) => {
    expect(selection.normalizeTo(EXAMPLE_DATA)).toEqual(expected);
  });
});

describe("Selection.prototype.has()", () => {
  const cases: Array<
    [name: string, selection: Selection, point: Point.Point, expected: boolean]
  > = [
    [
      "in range",
      new RangeSelection(new PointRange(Point.ORIGIN, Point.ORIGIN)),
      Point.ORIGIN,
      true,
    ],
    [
      "not selected",
      new RangeSelection(new PointRange(Point.ORIGIN, Point.ORIGIN)),
      EXAMPLE_NON_EXISTING_POINT,
      false,
    ],
  ];
  test.each(cases)("%s", (name, selected, point, expected) => {
    expect(selected.has(EXAMPLE_DATA, point)).toBe(expected);
  });
});

describe("Selection.prototype.size()", () => {
  const cases: Array<[name: string, selection: Selection, expected: number]> = [
    [
      "defined selection",
      new RangeSelection(new PointRange(Point.ORIGIN, Point.ORIGIN)),
      1,
    ],
    ["no selection", new EmptySelection(), 0],
  ];
  test.each(cases)("%s", (name, selection, expected) => {
    expect(selection.size(EXAMPLE_DATA)).toBe(expected);
  });
});

describe("getMatrixRange()", () => {
  test("Returns the point range of given matrix", () => {
    expect(getMatrixRange(EXAMPLE_DATA)).toEqual(
      new PointRange(Point.ORIGIN, {
        row: EXAMPLE_DATA_COLUMNS_COUNT - 1,
        column: EXAMPLE_DATA_ROWS_COUNT - 1,
      })
    );
  });
});

describe("Selection.prototype.hasEntireRow()", () => {
  const cases: Array<
    [name: string, selection: Selection, row: number, expected: boolean]
  > = [
    [
      "returns true for entire row in selection",
      new EntireRowsSelection(0, 0),
      0,
      true,
    ],
    [
      "returns false for row not in entire row selection",
      new EntireRowsSelection(0, 0),
      1,
      false,
    ],
    [
      "returns false for non-entire-rows selection",
      new EmptySelection(),
      0,
      false,
    ],
  ];
  test.each(cases)("%s", (name, selection, row, expected) => {
    expect(selection.hasEntireRow(row)).toBe(expected);
  });
});

describe("Selection.prototype.hasEntireColumn()", () => {
  const cases: Array<
    [name: string, selection: Selection, column: number, expected: boolean]
  > = [
    [
      "returns true for entire column in selection",
      new EntireColumnsSelection(0, 0),
      0,
      true,
    ],
    [
      "returns false for column not in entire column selection",
      new EntireColumnsSelection(0, 0),
      1,
      false,
    ],
    ["returns false for empty selection", new EmptySelection(), 0, false],
    ["returns false for empty selection", new EmptySelection(), 0, false],
  ];
  test.each(cases)("%s", (name, selection, column, expected) => {
    expect(selection.hasEntireColumn(column)).toBe(expected);
  });
});

describe("isIndex", () => {
  const cases = [
    ["returns true for a valid index", 0, true],
    ["returns false for non integer", 0.1, false],
    ["returns false for a negative integer", -1, false],
  ] as const;
  test.each(cases)("%s", (name, value, expected) => {
    expect(isIndex(value)).toEqual(expected);
  });
});
