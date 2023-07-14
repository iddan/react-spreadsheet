import * as Point from "./point";
import { PointRange } from "./point-range";
import * as Matrix from "./matrix";
import {
  Selection,
  EmptySelection,
  RangeSelection,
  EntireColumnsSelection,
  EntireRowsSelection,
  EntireTableSelection,
  InvalidIndexError,
  Direction,
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

describe("new EntireTableSelection()", () => {
  test("creates entire table selection", () => {
    new EntireTableSelection();
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
      "entire table",
      new EntireTableSelection(),
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

describe("Selection.prototype.modifyEdge()", () => {
  const cases: Array<
    [
      name: string,
      selection: Selection,
      active: Point.Point,
      data: Matrix.Matrix<unknown>,
      direction: Direction,
      expected: Selection
    ]
  > = [
    [
      "modifies range",
      new RangeSelection(new PointRange(Point.ORIGIN, Point.ORIGIN)),
      Point.ORIGIN,
      EXAMPLE_DATA,
      Direction.Right,
      new RangeSelection(new PointRange(Point.ORIGIN, { row: 0, column: 1 })),
    ],
    [
      "modifies entire rows",
      new EntireRowsSelection(0, 0),
      Point.ORIGIN,
      EXAMPLE_DATA,
      Direction.Bottom,
      new EntireRowsSelection(0, 1),
    ],
    [
      "modifies entire columns",
      new EntireColumnsSelection(0, 0),
      Point.ORIGIN,
      EXAMPLE_DATA,
      Direction.Right,
      new EntireColumnsSelection(0, 1),
    ],
    [
      "does nothing if no active and selection",
      new EmptySelection(),
      Point.ORIGIN,
      EXAMPLE_DATA,
      Direction.Left,
      new EmptySelection(),
    ],
  ];
  test.each(cases)("%s", (name, selection, active, data, edge, expected) => {
    expect(selection.modifyEdge(active, data, edge)).toEqual(expected);
  });
});

describe("RangeSelection.modifyEdge()", () => {
  const cases: Array<
    [
      name: string,
      selection: RangeSelection,
      active: Point.Point,
      data: Matrix.Matrix<unknown>,
      direction: Direction,
      expected: RangeSelection
    ]
  > = [
    [
      "modify left",
      new RangeSelection(
        new PointRange({ row: 0, column: 1 }, { row: 0, column: 1 })
      ),
      { row: 0, column: 1 },
      EXAMPLE_DATA,
      Direction.Left,
      new RangeSelection(new PointRange(Point.ORIGIN, { row: 0, column: 1 })),
    ],
    [
      "modify left, blocked",
      new RangeSelection(new PointRange(Point.ORIGIN, Point.ORIGIN)),
      Point.ORIGIN,
      EXAMPLE_DATA,
      Direction.Left,
      new RangeSelection(new PointRange(Point.ORIGIN, Point.ORIGIN)),
    ],
    [
      "modify left, backwards",
      new RangeSelection(new PointRange(Point.ORIGIN, { row: 0, column: 1 })),
      Point.ORIGIN,
      EXAMPLE_DATA,
      Direction.Left,
      new RangeSelection(new PointRange(Point.ORIGIN, Point.ORIGIN)),
    ],
    [
      "modify right",
      new RangeSelection(new PointRange(Point.ORIGIN, Point.ORIGIN)),
      Point.ORIGIN,
      EXAMPLE_DATA,
      Direction.Right,
      new RangeSelection(new PointRange(Point.ORIGIN, { row: 0, column: 1 })),
    ],
    [
      "modify right, blocked",
      new RangeSelection(
        new PointRange(EXAMPLE_DATA_MAX_POINT, EXAMPLE_DATA_MAX_POINT)
      ),
      EXAMPLE_DATA_MAX_POINT,
      EXAMPLE_DATA,
      Direction.Right,
      new RangeSelection(
        new PointRange(EXAMPLE_DATA_MAX_POINT, EXAMPLE_DATA_MAX_POINT)
      ),
    ],
    [
      "modify right, backwards",
      new RangeSelection(new PointRange(Point.ORIGIN, { row: 0, column: 1 })),
      { row: 0, column: 1 },
      EXAMPLE_DATA,
      Direction.Right,
      new RangeSelection(
        new PointRange({ row: 0, column: 1 }, { row: 0, column: 1 })
      ),
    ],
    [
      "modify top",
      new RangeSelection(
        new PointRange({ row: 1, column: 0 }, { row: 1, column: 0 })
      ),
      { row: 1, column: 0 },
      EXAMPLE_DATA,
      Direction.Top,
      new RangeSelection(new PointRange(Point.ORIGIN, { row: 1, column: 0 })),
    ],
    [
      "modify top, blocked",
      new RangeSelection(new PointRange(Point.ORIGIN, Point.ORIGIN)),
      Point.ORIGIN,
      EXAMPLE_DATA,
      Direction.Top,
      new RangeSelection(new PointRange(Point.ORIGIN, Point.ORIGIN)),
    ],
    [
      "modify top, backwards",
      new RangeSelection(new PointRange(Point.ORIGIN, { row: 1, column: 0 })),
      Point.ORIGIN,
      EXAMPLE_DATA,
      Direction.Top,
      new RangeSelection(new PointRange(Point.ORIGIN, Point.ORIGIN)),
    ],
    [
      "modify bottom",
      new RangeSelection(new PointRange(Point.ORIGIN, Point.ORIGIN)),
      Point.ORIGIN,
      EXAMPLE_DATA,
      Direction.Bottom,
      new RangeSelection(new PointRange(Point.ORIGIN, { row: 1, column: 0 })),
    ],
    [
      "modify bottom, blocked",
      new RangeSelection(
        new PointRange(EXAMPLE_DATA_MAX_POINT, EXAMPLE_DATA_MAX_POINT)
      ),
      EXAMPLE_DATA_MAX_POINT,
      EXAMPLE_DATA,
      Direction.Bottom,
      new RangeSelection(
        new PointRange(EXAMPLE_DATA_MAX_POINT, EXAMPLE_DATA_MAX_POINT)
      ),
    ],
    [
      "modify bottom, backwards",
      new RangeSelection(new PointRange(Point.ORIGIN, { row: 1, column: 0 })),
      { row: 1, column: 0 },
      EXAMPLE_DATA,
      Direction.Bottom,
      new RangeSelection(
        new PointRange({ row: 1, column: 0 }, { row: 1, column: 0 })
      ),
    ],
  ];
  test.each(cases)("%s", (name, selection, active, data, edge, expected) => {
    expect(selection.modifyEdge(active, data, edge)).toEqual(expected);
  });
});

describe("EntireRowsSelection.modifyEdge()", () => {
  const cases: Array<
    [
      name: string,
      selection: EntireRowsSelection,
      active: Point.Point,
      data: Matrix.Matrix<unknown>,
      direction: Direction,
      expected: EntireRowsSelection
    ]
  > = [
    [
      "modify left",
      new EntireRowsSelection(0, 0),
      { row: 0, column: 1 },
      EXAMPLE_DATA,
      Direction.Left,
      new EntireRowsSelection(0, 0),
    ],
    [
      "modify right",
      new EntireRowsSelection(0, 0),
      Point.ORIGIN,
      EXAMPLE_DATA,
      Direction.Right,
      new EntireRowsSelection(0, 0),
    ],
    [
      "modify top",
      new EntireRowsSelection(1, 1),
      { row: 1, column: 0 },
      EXAMPLE_DATA,
      Direction.Top,
      new EntireRowsSelection(0, 1),
    ],
    [
      "modify top, blocked",
      new EntireRowsSelection(0, 0),
      Point.ORIGIN,
      EXAMPLE_DATA,
      Direction.Top,
      new EntireRowsSelection(0, 0),
    ],
    [
      "modify top, backwards",
      new EntireRowsSelection(0, 1),
      Point.ORIGIN,
      EXAMPLE_DATA,
      Direction.Top,
      new EntireRowsSelection(0, 0),
    ],
    [
      "modify bottom",
      new EntireRowsSelection(0, 0),
      Point.ORIGIN,
      EXAMPLE_DATA,
      Direction.Bottom,
      new EntireRowsSelection(0, 1),
    ],
    [
      "modify bottom, blocked",
      new EntireRowsSelection(
        EXAMPLE_DATA_MAX_POINT.row,
        EXAMPLE_DATA_MAX_POINT.row
      ),
      EXAMPLE_DATA_MAX_POINT,
      EXAMPLE_DATA,
      Direction.Bottom,
      new EntireRowsSelection(
        EXAMPLE_DATA_MAX_POINT.row,
        EXAMPLE_DATA_MAX_POINT.row
      ),
    ],
    [
      "modify bottom, backwards",
      new EntireRowsSelection(0, 1),
      { row: 1, column: 0 },
      EXAMPLE_DATA,
      Direction.Bottom,
      new EntireRowsSelection(1, 1),
    ],
  ];
  test.each(cases)("%s", (name, selection, active, data, edge, expected) => {
    expect(selection.modifyEdge(active, data, edge)).toEqual(expected);
  });
});

describe("EntireColumnsSelection.modifyEdge()", () => {
  const cases: Array<
    [
      name: string,
      selection: EntireColumnsSelection,
      active: Point.Point,
      data: Matrix.Matrix<unknown>,
      direction: Direction,
      expected: EntireColumnsSelection
    ]
  > = [
    [
      "modify top",
      new EntireColumnsSelection(0, 0),
      { row: 1, column: 0 },
      EXAMPLE_DATA,
      Direction.Top,
      new EntireColumnsSelection(0, 0),
    ],
    [
      "modify bottom",
      new EntireColumnsSelection(0, 0),
      Point.ORIGIN,
      EXAMPLE_DATA,
      Direction.Bottom,
      new EntireColumnsSelection(0, 0),
    ],
    [
      "modify left",
      new EntireColumnsSelection(1, 1),
      { row: 0, column: 1 },
      EXAMPLE_DATA,
      Direction.Left,
      new EntireColumnsSelection(0, 1),
    ],
    [
      "modify left, blocked",
      new EntireColumnsSelection(0, 0),
      Point.ORIGIN,
      EXAMPLE_DATA,
      Direction.Left,
      new EntireColumnsSelection(0, 0),
    ],
    [
      "modify left, backwards",
      new EntireColumnsSelection(0, 1),
      Point.ORIGIN,
      EXAMPLE_DATA,
      Direction.Left,
      new EntireColumnsSelection(0, 0),
    ],
    [
      "modify right",
      new EntireColumnsSelection(0, 0),
      Point.ORIGIN,
      EXAMPLE_DATA,
      Direction.Right,
      new EntireColumnsSelection(0, 1),
    ],
    [
      "modify right, blocked",
      new EntireColumnsSelection(
        EXAMPLE_DATA_MAX_POINT.row,
        EXAMPLE_DATA_MAX_POINT.row
      ),
      EXAMPLE_DATA_MAX_POINT,
      EXAMPLE_DATA,
      Direction.Right,
      new EntireColumnsSelection(
        EXAMPLE_DATA_MAX_POINT.row,
        EXAMPLE_DATA_MAX_POINT.row
      ),
    ],
    [
      "modify right, backwards",
      new EntireColumnsSelection(0, 1),
      { row: 0, column: 1 },
      EXAMPLE_DATA,
      Direction.Right,
      new EntireColumnsSelection(1, 1),
    ],
  ];
  test.each(cases)("%s", (name, selection, active, data, edge, expected) => {
    expect(selection.modifyEdge(active, data, edge)).toEqual(expected);
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
    [
      "returns false for non-entire-columns selection",
      new EmptySelection(),
      0,
      false,
    ],
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
