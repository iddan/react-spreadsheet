import {
  moveCursorToEnd,
  calculateSpreadsheetSize,
  createEmptyMatrix,
  range,
  getCellDimensions,
  getRangeDimensions,
  isPointEqual,
  isActive,
  writeTextToClipboard,
  PLAIN_TEXT_MIME,
} from "./util";
import * as types from "./types";
import * as PointMap from "./point-map";

const EXAMPLE_INPUT_VALUE = "EXAMPLE_INPUT_VALUE";
const EXAMPLE_DATA_ROWS_COUNT = 2;
const EXAMPLE_DATA_COLUMNS_COUNT = 2;
const EXAMPLE_DATA = createEmptyMatrix<types.CellBase>(
  EXAMPLE_DATA_ROWS_COUNT,
  EXAMPLE_DATA_COLUMNS_COUNT
);
const EXAMPLE_ROW_LABELS = ["Foo", "Bar", "Baz"];
const EXAMPLE_COLUMN_LABELS = ["Foo", "Bar", "Baz"];
const EXAMPLE_EXISTING_POINT: types.Point = {
  row: 0,
  column: 0,
};
const EXAMPLE_NON_EXISTING_POINT: types.Point = {
  row: EXAMPLE_DATA_ROWS_COUNT,
  column: EXAMPLE_DATA_COLUMNS_COUNT,
};
const EXAMPLE_CELL_DIMENSIONS: types.Dimensions = {
  height: 200,
  width: 20,
  top: 0,
  left: 0,
};
const EXAMPLE_STATE: types.StoreState = {
  active: null,
  mode: "view",
  rowDimensions: {
    0: {
      height: EXAMPLE_CELL_DIMENSIONS.height,
      top: EXAMPLE_CELL_DIMENSIONS.top,
    },
    1: {
      height: EXAMPLE_CELL_DIMENSIONS.height,
      top: EXAMPLE_CELL_DIMENSIONS.top + EXAMPLE_CELL_DIMENSIONS.height,
    },
  },
  columnDimensions: {
    0: {
      width: EXAMPLE_CELL_DIMENSIONS.width,
      left: EXAMPLE_CELL_DIMENSIONS.left,
    },
    1: {
      width: EXAMPLE_CELL_DIMENSIONS.width,
      left: EXAMPLE_CELL_DIMENSIONS.left + EXAMPLE_CELL_DIMENSIONS.width,
    },
  },
  lastChanged: null,
  hasPasted: false,
  cut: false,
  dragging: false,
  data: EXAMPLE_DATA,
  selected: null,
  copied: PointMap.from([]),
  bindings: PointMap.from([]),
  lastCommit: null,
};

describe("moveCursorToEnd()", () => {
  test("moves cursor to the end", () => {
    const el = document.createElement("input");
    el.value = EXAMPLE_INPUT_VALUE;
    moveCursorToEnd(el);
    expect(el.selectionStart).toBe(EXAMPLE_INPUT_VALUE.length);
    expect(el.selectionEnd).toBe(EXAMPLE_INPUT_VALUE.length);
  });
});

describe("range()", () => {
  test("basic use of range", () => {
    const end = 10;
    const start = 1;
    const step = 2;
    const res = range(end, start, step);

    expect(res).toEqual([1, 3, 5, 7, 9]);
  });

  test("range with negative numbers", () => {
    const end = 10;
    const start = -10;
    const step = 2;

    const res = range(end, start, step);

    expect(res).toEqual([-10, -8, -6, -4, -2, 0, 2, 4, 6, 8]);
  });

  test("range with larger start to return decreasing series", () => {
    const end = 1;
    const start = 5;
    const res = range(end, start);

    expect(res).toEqual([5, 4, 3, 2]);
  });
});

describe("calculateSpreadsheetSize()", () => {
  test("Returns the size of data if row labels and column labels are not defined", () => {
    expect(calculateSpreadsheetSize(EXAMPLE_DATA)).toStrictEqual({
      rows: EXAMPLE_DATA_ROWS_COUNT,
      columns: EXAMPLE_DATA_COLUMNS_COUNT,
    });
  });

  test("Returns the size of row labels if row labels is longer than data rows", () => {
    expect(
      calculateSpreadsheetSize(EXAMPLE_DATA, EXAMPLE_ROW_LABELS)
    ).toStrictEqual({
      rows: EXAMPLE_ROW_LABELS.length,
      columns: EXAMPLE_DATA_COLUMNS_COUNT,
    });
  });

  test("Returns the size of column labels if column labels is longer than data columns", () => {
    expect(
      calculateSpreadsheetSize(EXAMPLE_DATA, undefined, EXAMPLE_COLUMN_LABELS)
    ).toStrictEqual({
      rows: EXAMPLE_DATA_ROWS_COUNT,
      columns: EXAMPLE_COLUMN_LABELS.length,
    });
  });
});

describe("getCellDimensions()", () => {
  const cases = [
    [
      "returns existing cell dimensions",
      EXAMPLE_EXISTING_POINT,
      EXAMPLE_STATE,
      EXAMPLE_CELL_DIMENSIONS,
    ],
    [
      "returns undefined for non existing cell",
      EXAMPLE_NON_EXISTING_POINT,
      EXAMPLE_STATE,
      undefined,
    ],
  ] as const;
  test.each(cases)("%s", (name, point, state, expected) => {
    expect(getCellDimensions(point, state)).toEqual(expected);
  });
});

describe("getRangeDimensions()", () => {
  const cases = [
    [
      "returns undefined for non existing start",
      EXAMPLE_STATE,
      { start: EXAMPLE_NON_EXISTING_POINT, end: EXAMPLE_EXISTING_POINT },
      undefined,
    ],
    [
      "returns undefined for non existing end",
      EXAMPLE_STATE,
      { start: EXAMPLE_EXISTING_POINT, end: EXAMPLE_NON_EXISTING_POINT },
      undefined,
    ],
    [
      "returns undefined for non existing start and end",
      EXAMPLE_STATE,
      { start: EXAMPLE_NON_EXISTING_POINT, end: EXAMPLE_NON_EXISTING_POINT },
      undefined,
    ],
    [
      "returns dimensions of range of one cell",
      EXAMPLE_STATE,
      { start: EXAMPLE_EXISTING_POINT, end: EXAMPLE_EXISTING_POINT },
      EXAMPLE_CELL_DIMENSIONS,
    ],
    [
      "returns dimensions of range of two horizontal cells",
      EXAMPLE_STATE,
      { start: { row: 0, column: 0 }, end: { row: 0, column: 1 } },
      {
        ...EXAMPLE_CELL_DIMENSIONS,
        width: EXAMPLE_CELL_DIMENSIONS.width * 2,
      },
    ],
    [
      "returns dimensions of range of two vertical cells",
      EXAMPLE_STATE,
      { start: { row: 0, column: 0 }, end: { row: 1, column: 0 } },
      {
        ...EXAMPLE_CELL_DIMENSIONS,
        height: EXAMPLE_CELL_DIMENSIONS.height * 2,
      },
    ],
    [
      "returns dimensions of range of a square of cells",
      EXAMPLE_STATE,
      { start: { row: 0, column: 0 }, end: { row: 1, column: 1 } },
      {
        ...EXAMPLE_CELL_DIMENSIONS,
        width: EXAMPLE_CELL_DIMENSIONS.width * 2,
        height: EXAMPLE_CELL_DIMENSIONS.height * 2,
      },
    ],
  ] as const;
  test.each(cases)("%s", (name, state, range, expected) => {
    expect(getRangeDimensions(state, range)).toEqual(expected);
  });
});

describe("isPointEqual()", () => {
  const cases = [
    [
      "returns true for equal points",
      { row: 0, column: 0 },
      { row: 0, column: 0 },
      true,
    ],
    [
      "returns false for non equal points",
      { row: 0, column: 0 },
      { row: 1, column: 1 },
      false,
    ],
  ] as const;
  test.each(cases)("%s", (name, source, target, expected) => {
    expect(isPointEqual(source, target)).toBe(expected);
  });
});

describe("isActive()", () => {
  const cases = [
    ["returns false if active is null", null, EXAMPLE_EXISTING_POINT, false],
    [
      "returns false if given point is not null",
      { row: 1, column: 1 },
      EXAMPLE_EXISTING_POINT,
      false,
    ],
    [
      "returns true if given point is active",
      EXAMPLE_EXISTING_POINT,
      EXAMPLE_EXISTING_POINT,
      true,
    ],
  ] as const;
  test.each(cases)("%s", (name, active, point, expected) => {
    expect(isActive(active, point)).toBe(expected);
  });
});

describe("writeTextToClipboard()", () => {
  const event = {
    clipboardData: {
      setData: jest.fn(),
    },
  };
  const data = "Hello, World!";
  writeTextToClipboard(event as unknown as ClipboardEvent, data);
  expect(event.clipboardData.setData).toBeCalledTimes(1);
  expect(event.clipboardData.setData).toBeCalledWith(PLAIN_TEXT_MIME, data);
});
