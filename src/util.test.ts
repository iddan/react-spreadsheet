/**
 * @jest-environment jsdom
 */

import { Model } from "./engine";
import * as Matrix from "./matrix";
import * as Point from "./point";
import { PointRange } from "./point-range";
import { Selection, EmptySelection, RangeSelection } from "./selection";
import * as Types from "./types";
import * as util from "./util";

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
  height: 20,
  width: 200,
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
  model: new Model(EXAMPLE_DATA),
  selected: new EmptySelection(),
  copied: null,
  lastCommit: null,
};
const EXAMPLE_STRING = "EXAMPLE_STRING";

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe("moveCursorToEnd()", () => {
  test("moves cursor to the end", () => {
    const el = document.createElement("input");
    el.value = EXAMPLE_INPUT_VALUE;
    util.moveCursorToEnd(el);
    expect(el.selectionStart).toBe(EXAMPLE_INPUT_VALUE.length);
    expect(el.selectionEnd).toBe(EXAMPLE_INPUT_VALUE.length);
  });
});

describe("range()", () => {
  test("basic use of range", () => {
    const end = 10;
    const start = 1;
    const step = 2;
    const res = util.range(end, start, step);

    expect(res).toEqual([1, 3, 5, 7, 9]);
  });

  test("range with negative numbers", () => {
    const end = 10;
    const start = -10;
    const step = 2;

    const res = util.range(end, start, step);

    expect(res).toEqual([-10, -8, -6, -4, -2, 0, 2, 4, 6, 8]);
  });

  test("range with larger start to return decreasing series", () => {
    const end = 1;
    const start = 5;
    const res = util.range(end, start);

    expect(res).toEqual([5, 4, 3, 2]);
  });
});

describe("calculateSpreadsheetSize()", () => {
  test("Returns the size of data if row labels and column labels are not defined", () => {
    expect(util.calculateSpreadsheetSize(EXAMPLE_DATA)).toStrictEqual({
      rows: EXAMPLE_DATA_ROWS_COUNT,
      columns: EXAMPLE_DATA_COLUMNS_COUNT,
    });
  });

  test("Returns the size of row labels if row labels is longer than data rows", () => {
    expect(
      util.calculateSpreadsheetSize(EXAMPLE_DATA, EXAMPLE_ROW_LABELS)
    ).toStrictEqual({
      rows: EXAMPLE_ROW_LABELS.length,
      columns: EXAMPLE_DATA_COLUMNS_COUNT,
    });
  });

  test("Returns the size of column labels if column labels is longer than data columns", () => {
    expect(
      util.calculateSpreadsheetSize(
        EXAMPLE_DATA,
        undefined,
        EXAMPLE_COLUMN_LABELS
      )
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
      EXAMPLE_CELL_DIMENSIONS,
    ],
    [
      "returns undefined for non existing cell",
      EXAMPLE_NON_EXISTING_POINT,
      undefined,
    ],
  ] as const;
  test.each(cases)("%s", (name, point, expected) => {
    expect(
      util.getCellDimensions(
        point,
        EXAMPLE_STATE.rowDimensions,
        EXAMPLE_STATE.columnDimensions
      )
    ).toEqual(expected);
  });
});

describe("getRangeDimensions()", () => {
  const cases: Array<
    [name: string, range: PointRange, expected: Types.Dimensions | undefined]
  > = [
    [
      "returns undefined for non existing start",
      new PointRange(EXAMPLE_NON_EXISTING_POINT, EXAMPLE_EXISTING_POINT),
      undefined,
    ],
    [
      "returns undefined for non existing end",
      new PointRange(EXAMPLE_EXISTING_POINT, EXAMPLE_NON_EXISTING_POINT),
      undefined,
    ],
    [
      "returns undefined for non existing start and end",
      new PointRange(EXAMPLE_NON_EXISTING_POINT, EXAMPLE_NON_EXISTING_POINT),
      undefined,
    ],
    [
      "returns dimensions of range of one cell",
      new PointRange(EXAMPLE_EXISTING_POINT, EXAMPLE_EXISTING_POINT),
      EXAMPLE_CELL_DIMENSIONS,
    ],
    [
      "returns dimensions of range of two horizontal cells",
      new PointRange(Point.ORIGIN, { row: 0, column: 1 }),
      {
        ...EXAMPLE_CELL_DIMENSIONS,
        width: EXAMPLE_CELL_DIMENSIONS.width * 2,
      },
    ],
    [
      "returns dimensions of range of two vertical cells",
      new PointRange(Point.ORIGIN, { row: 1, column: 0 }),
      {
        ...EXAMPLE_CELL_DIMENSIONS,
        height: EXAMPLE_CELL_DIMENSIONS.height * 2,
      },
    ],
    [
      "returns dimensions of range of a square of cells",
      new PointRange(Point.ORIGIN, { row: 1, column: 1 }),
      {
        ...EXAMPLE_CELL_DIMENSIONS,
        width: EXAMPLE_CELL_DIMENSIONS.width * 2,
        height: EXAMPLE_CELL_DIMENSIONS.height * 2,
      },
    ],
  ];
  test.each(cases)("%s", (name, range, expected) => {
    expect(
      util.getRangeDimensions(
        EXAMPLE_STATE.rowDimensions,
        EXAMPLE_STATE.columnDimensions,
        range
      )
    ).toEqual(expected);
  });
});

describe("getSelectedDimensions()", () => {
  const cases: Array<
    [name: string, selection: Selection, expected: Types.Dimensions | undefined]
  > = [
    [
      "point range",
      new RangeSelection(new PointRange(Point.ORIGIN, Point.ORIGIN)),
      util.getRangeDimensions(
        EXAMPLE_STATE.rowDimensions,
        EXAMPLE_STATE.columnDimensions,
        new PointRange(Point.ORIGIN, Point.ORIGIN)
      ),
    ],
    ["no selection", new EmptySelection(), undefined],
  ];
  test.each(cases)("%s", (name, selection, expected) => {
    expect(
      util.getSelectedDimensions(
        EXAMPLE_STATE.rowDimensions,
        EXAMPLE_STATE.columnDimensions,
        EXAMPLE_STATE.model.data,
        selection
      )
    ).toEqual(expected);
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
    expect(util.isActive(active, point)).toBe(expected);
  });
});

describe("writeTextToClipboard()", () => {
  const event = {
    clipboardData: {
      setData: jest.fn(),
    },
  };
  util.writeTextToClipboard(event as unknown as ClipboardEvent, EXAMPLE_STRING);
  expect(event.clipboardData.setData).toBeCalledTimes(1);
  expect(event.clipboardData.setData).toBeCalledWith(
    util.PLAIN_TEXT_MIME,
    EXAMPLE_STRING
  );
});

describe("getCSV()", () => {
  test("Returns given data as CSV", () => {
    expect(util.getCSV(EXAMPLE_DATA)).toBe(
      Matrix.join(
        Matrix.createEmpty(EXAMPLE_DATA_ROWS_COUNT, EXAMPLE_DATA_COLUMNS_COUNT)
      )
    );
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
    expect(util.getOffsetRect(MOCK_ELEMENT)).toEqual({
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
    expect(util.readTextFromClipboard(EXAMPLE_CLIPBOARD_EVENT)).toEqual("");
  });
  test("Returns string from event", () => {
    const EXAMPLE_CLIPBOARD_EVENT = {
      clipboardData: {
        getData: jest.fn(() => EXAMPLE_STRING),
      },
    } as unknown as ClipboardEvent;
    expect(util.readTextFromClipboard(EXAMPLE_CLIPBOARD_EVENT)).toEqual(
      EXAMPLE_STRING
    );
    expect(EXAMPLE_CLIPBOARD_EVENT.clipboardData?.getData).toBeCalledTimes(1);
    expect(EXAMPLE_CLIPBOARD_EVENT.clipboardData?.getData).toBeCalledWith(
      util.PLAIN_TEXT_MIME
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
    expect(util.readTextFromClipboard(EXAMPLE_CLIPBOARD_EVENT)).toBe(
      EXAMPLE_STRING
    );
    // @ts-ignore
    expect(MOCK_CLIPBOARD_DATA.getData).toBeCalledTimes(1);
    expect(MOCK_CLIPBOARD_DATA.getData).toBeCalledWith("Text");
    // Undefine as it is not a native JS-DOM property
    // @ts-ignore
    delete window.clipoardData;
  });
});

describe("shouldHandleClipboardEvent()", () => {
  const matchesMock = jest.fn();
  const mockElement = {
    matches: matchesMock,
  } as unknown as Element;
  const cases = [
    ["return false if root is null", null, false, "view" as Types.Mode, false],
    [
      "return false if mode is not view",
      mockElement,
      false,
      "edit" as Types.Mode,
      false,
    ],
    [
      "return true if root is focused within and mode is view",
      mockElement,
      true,
      "view" as Types.Mode,
      true,
    ],
  ] as const;
  beforeEach(() => {
    // Prevent accumulation return values
    matchesMock.mockReset();
  });
  test.each(cases)("%s", (name, root, focusedWithin, mode, expected) => {
    // Bound to implemnetation of isFocusedWithin()
    matchesMock.mockReturnValueOnce(focusedWithin);
    expect(util.shouldHandleClipboardEvent(root, mode)).toBe(expected);
  });
});

describe("isFocusedWithin()", () => {
  const matchesMock = jest.fn();
  const mockElement = {
    matches: matchesMock,
  } as unknown as Element;
  const cases = [
    ["matches selector", mockElement, true, true],
    ["does not match selector", mockElement, false, false],
  ] as const;
  test.each(cases)("%s", (name, element, matches, expected) => {
    matchesMock.mockReturnValueOnce(matches);
    expect(util.isFocusedWithin(element)).toBe(expected);
    expect(matchesMock).toBeCalledTimes(1);
    expect(matchesMock).toBeCalledWith(util.FOCUS_WITHIN_SELECTOR);
  });
});
