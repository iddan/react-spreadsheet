/**
 * @jest-environment jsdom
 */

import type { Parser as FormulaParser } from "hot-formula-parser";
import * as Formula from "./formula";
import * as Matrix from "./matrix";
import * as Point from "./point";
import * as PointMap from "./point-map";
import * as PointRange from "./point-range";
import * as Types from "./types";
import {
  moveCursorToEnd,
  calculateSpreadsheetSize,
  range,
  getCellDimensions,
  getRangeDimensions,
  isActive,
  writeTextToClipboard,
  PLAIN_TEXT_MIME,
  getComputedValue,
  getFormulaComputedValue,
  isFormulaCell,
  getMatrixRange,
  getCSV,
  getSelectedCSV,
  getOffsetRect,
  readTextFromClipboard,
  normalizeSelected,
} from "./util";

const EXAMPLE_INPUT_VALUE = "EXAMPLE_INPUT_VALUE";
const EXAMPLE_DATA_ROWS_COUNT = 2;
const EXAMPLE_DATA_COLUMNS_COUNT = 2;
const EXAMPLE_DATA = Matrix.createEmpty<Types.CellBase>(
  EXAMPLE_DATA_ROWS_COUNT,
  EXAMPLE_DATA_COLUMNS_COUNT
);
const EXAMPLE_ROW_LABELS = ["Foo", "Bar", "Baz"];
const EXAMPLE_COLUMN_LABELS = ["Foo", "Bar", "Baz"];
const EXAMPLE_EXISTING_POINT = Point.ORIGIN;
const EXAMPLE_NON_EXISTING_POINT: Point.Point = {
  row: EXAMPLE_DATA_ROWS_COUNT,
  column: EXAMPLE_DATA_COLUMNS_COUNT,
};
const EXAMPLE_CELL_DIMENSIONS: Types.Dimensions = {
  height: 200,
  width: 20,
  top: 0,
  left: 0,
};
const EXAMPLE_STATE: Types.StoreState = {
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
const EXAMPLE_STRING = "EXAMPLE_STRING";
const EXAMPLE_CELL: Types.CellBase = {
  value: "EXAMPLE_CELL_VALUE",
};
const EXAMPLE_FORMULA_CELL: Types.CellBase = {
  value: "=TRUE()",
};
const MOCK_PARSE = jest.fn();
const MOCK_FORMULA_PARSER = {
  parse: MOCK_PARSE,
} as unknown as FormulaParser;
const EXAMPLE_FORMULA_RESULT = true;
const EXAMPLE_FORMULA_ERROR = "EXAMPLE_ERROR";

beforeEach(() => {
  jest.clearAllMocks();
});

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
      { start: Point.ORIGIN, end: { row: 0, column: 1 } },
      {
        ...EXAMPLE_CELL_DIMENSIONS,
        width: EXAMPLE_CELL_DIMENSIONS.width * 2,
      },
    ],
    [
      "returns dimensions of range of two vertical cells",
      EXAMPLE_STATE,
      { start: Point.ORIGIN, end: { row: 1, column: 0 } },
      {
        ...EXAMPLE_CELL_DIMENSIONS,
        height: EXAMPLE_CELL_DIMENSIONS.height * 2,
      },
    ],
    [
      "returns dimensions of range of a square of cells",
      EXAMPLE_STATE,
      { start: Point.ORIGIN, end: { row: 1, column: 1 } },
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
  writeTextToClipboard(event as unknown as ClipboardEvent, EXAMPLE_STRING);
  expect(event.clipboardData.setData).toBeCalledTimes(1);
  expect(event.clipboardData.setData).toBeCalledWith(
    PLAIN_TEXT_MIME,
    EXAMPLE_STRING
  );
});

describe("getComputedValue()", () => {
  test("Returns null if cell is not defined", () => {
    expect(
      getComputedValue({ cell: undefined, formulaParser: MOCK_FORMULA_PARSER })
    ).toBe(null);
    expect(MOCK_FORMULA_PARSER.parse).toBeCalledTimes(0);
  });
  test("Returns value if not formula", () => {
    expect(
      getComputedValue({
        cell: EXAMPLE_CELL,
        formulaParser: MOCK_FORMULA_PARSER,
      })
    ).toBe(EXAMPLE_CELL.value);
    expect(MOCK_FORMULA_PARSER.parse).toBeCalledTimes(0);
  });
  test("Returns evaluated formula value", () => {
    MOCK_PARSE.mockImplementationOnce(() => ({
      result: EXAMPLE_FORMULA_RESULT,
      error: null,
    }));
    expect(
      getComputedValue({
        cell: EXAMPLE_FORMULA_CELL,
        formulaParser: MOCK_FORMULA_PARSER,
      })
    ).toBe(EXAMPLE_FORMULA_RESULT);
  });
});

describe("getFormulaComputedValue()", () => {
  const cases = [
    [
      "Returns parsed formula result",
      EXAMPLE_FORMULA_RESULT,
      { result: EXAMPLE_FORMULA_RESULT, error: null },
    ],
    [
      "Returns parsed formula error",
      EXAMPLE_FORMULA_ERROR,
      { result: null, error: EXAMPLE_FORMULA_ERROR },
    ],
  ] as const;
  test.each(cases)("%s", (name, expected, mockParseReturn) => {
    MOCK_PARSE.mockImplementationOnce(() => mockParseReturn);
    expect(
      getFormulaComputedValue({
        cell: EXAMPLE_FORMULA_CELL,
        formulaParser: MOCK_FORMULA_PARSER,
      })
    ).toBe(expected);
    expect(MOCK_FORMULA_PARSER.parse).toBeCalledTimes(1);
    expect(MOCK_FORMULA_PARSER.parse).toBeCalledWith(
      Formula.extractFormula(EXAMPLE_FORMULA_CELL.value)
    );
  });
});

describe("isFormulaCell()", () => {
  const cases = [
    ["Returns true for formula cell", EXAMPLE_FORMULA_CELL, true],
    ["Returns true for formula cell", EXAMPLE_CELL, false],
  ] as const;
  test.each(cases)("%s", (name, cell, expected) => {
    expect(isFormulaCell(cell)).toBe(expected);
  });
});

describe("getMatrixRange()", () => {
  test("Returns the point range of given matrix", () => {
    expect(getMatrixRange(EXAMPLE_DATA)).toEqual(
      PointRange.create(Point.ORIGIN, {
        row: EXAMPLE_DATA_COLUMNS_COUNT - 1,
        column: EXAMPLE_DATA_ROWS_COUNT - 1,
      })
    );
  });
});

describe("getCSV()", () => {
  test("Returns given data as CSV", () => {
    expect(getCSV(EXAMPLE_DATA)).toBe(
      Matrix.join(
        Matrix.createEmpty(EXAMPLE_DATA_ROWS_COUNT, EXAMPLE_DATA_COLUMNS_COUNT)
      )
    );
  });
});

describe("getSelectedCSV()", () => {
  test("Returns empty for no selected range", () => {
    expect(getSelectedCSV(null, EXAMPLE_DATA)).toBe("");
  });
  test("Returns CSV for selected range", () => {
    expect(
      getSelectedCSV(
        { start: Point.ORIGIN, end: { row: 1, column: 1 } },
        EXAMPLE_DATA
      )
    ).toEqual(Matrix.join(Matrix.createEmpty(2, 2)));
  });
});

describe("getOffsetRect()", () => {
  test("Returns object with the offsets of the given element", () => {
    const MOCK_ELEMENT = {
      offsetWidth: 42,
      offsetHeight: 42,
      offsetLeft: 42,
      offsetTop: 42,
    } as unknown as HTMLElement;
    expect(getOffsetRect(MOCK_ELEMENT)).toEqual({
      width: MOCK_ELEMENT.offsetWidth,
      height: MOCK_ELEMENT.offsetHeight,
      left: MOCK_ELEMENT.offsetLeft,
      top: MOCK_ELEMENT.offsetTop,
    });
  });
});

describe("readTextFromClipboard()", () => {
  test("Returns empty string if no text is defined", () => {
    const EXAMPLE_CLIPBOARD_EVENT = {} as ClipboardEvent;
    expect(readTextFromClipboard(EXAMPLE_CLIPBOARD_EVENT)).toEqual("");
  });
  test("Returns string from event", () => {
    const EXAMPLE_CLIPBOARD_EVENT = {
      clipboardData: {
        getData: jest.fn(() => EXAMPLE_STRING),
      },
    } as unknown as ClipboardEvent;
    expect(readTextFromClipboard(EXAMPLE_CLIPBOARD_EVENT)).toEqual(
      EXAMPLE_STRING
    );
    expect(EXAMPLE_CLIPBOARD_EVENT.clipboardData?.getData).toBeCalledTimes(1);
    expect(EXAMPLE_CLIPBOARD_EVENT.clipboardData?.getData).toBeCalledWith(
      PLAIN_TEXT_MIME
    );
  });
  test("Returns string from window", () => {
    const EXAMPLE_CLIPBOARD_EVENT = {} as ClipboardEvent;
    const MOCK_CLIPBOARD_DATA = {
      getData: jest.fn(() => EXAMPLE_STRING),
    };
    // Define for the test as it is not a native JS-DOM property
    // @ts-ignore
    window.clipboardData = MOCK_CLIPBOARD_DATA;
    expect(readTextFromClipboard(EXAMPLE_CLIPBOARD_EVENT)).toBe(EXAMPLE_STRING);
    // @ts-ignore
    expect(MOCK_CLIPBOARD_DATA.getData).toBeCalledTimes(1);
    expect(MOCK_CLIPBOARD_DATA.getData).toBeCalledWith("Text");
    // Undefine as it is not a native JS-DOM property
    // @ts-ignore
    delete window.clipoardData;
  });
});

describe("normalizeSelected()", () => {
  test("Normalizes given selected range to given data", () => {
    const EXAMPLE_RANGE = PointRange.create(Point.ORIGIN, {
      row: EXAMPLE_DATA_ROWS_COUNT,
      column: EXAMPLE_DATA_COLUMNS_COUNT,
    });
    expect(normalizeSelected(EXAMPLE_RANGE, EXAMPLE_DATA)).toEqual(
      PointRange.create(Point.ORIGIN, Matrix.maxPoint(EXAMPLE_DATA))
    );
  });
});
