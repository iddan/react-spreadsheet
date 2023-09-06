import * as React from "react";
import * as Types from "./types";
import * as Actions from "./actions";
import reducer, {
  INITIAL_STATE,
  hasKeyDownHandler,
  isActiveReadOnly,
  modifyEdge,
  modifyRangeSelectionEdge,
  modifyEntireRowsSelection,
  modifyEntireColumnsSelection,
  Direction,
} from "./reducer";
import { createEmptyMatrix } from "./util";
import * as Point from "./point";
import * as Matrix from "./matrix";
import { PointRange } from "./point-range";
import {
  Selection,
  RangeSelection,
  EntireWorksheetSelection,
  EntireRowsSelection,
  EntireColumnsSelection,
  EmptySelection,
} from "./selection";
import "./areModelsEqual";
import { Model, createFormulaParser } from "./engine";

const EDIT_STATE: Types.StoreState = { ...INITIAL_STATE, mode: "edit" };
const EXAMPLE_DATA_ROWS_COUNT = 4;
const EXAMPLE_DATA_COLUMNS_COUNT = 4;
const EXAMPLE_DATA = createEmptyMatrix<Types.CellBase>(
  EXAMPLE_DATA_ROWS_COUNT,
  EXAMPLE_DATA_COLUMNS_COUNT
);
const EXAMPLE_DATA_MAX_POINT = Matrix.maxPoint(EXAMPLE_DATA);
const EXAMPLE_ROW = 2;
const EXAMPLE_COLUMN = 2;
const EXAMPLE_POINT: Point.Point = { row: EXAMPLE_ROW, column: EXAMPLE_COLUMN };
const EXAMPLE_CELL: Types.CellBase = { value: 42 };
const EXAMPLE_DIMENSIONS: Types.Dimensions = {
  left: 0,
  top: 0,
  width: 42,
  height: 42,
};

describe("reducer", () => {
  const cases: Array<
    [
      name: string,
      state: Types.StoreState,
      action: Actions.Action,
      expected: Types.StoreState
    ]
  > = [
    [
      "setData",
      INITIAL_STATE,
      Actions.setData(EXAMPLE_DATA),
      { ...INITIAL_STATE, model: new Model(createFormulaParser, EXAMPLE_DATA) },
    ],
    [
      "select",
      { ...INITIAL_STATE, active: Point.ORIGIN },
      Actions.select(EXAMPLE_POINT),
      {
        ...INITIAL_STATE,
        active: Point.ORIGIN,
        selected: new RangeSelection(
          new PointRange(Point.ORIGIN, EXAMPLE_POINT)
        ),
      },
    ],
    [
      "select an entire worksheet",
      INITIAL_STATE,
      Actions.selectEntireWorksheet(),
      {
        ...INITIAL_STATE,
        active: Point.ORIGIN,
        selected: new EntireWorksheetSelection(),
      },
    ],
    [
      "select an entire row",
      { ...INITIAL_STATE, active: Point.ORIGIN },
      Actions.selectEntireRow(EXAMPLE_ROW, false),
      {
        ...INITIAL_STATE,
        active: { ...Point.ORIGIN, row: EXAMPLE_ROW },
        selected: new EntireRowsSelection(EXAMPLE_ROW, EXAMPLE_ROW),
      },
    ],
    [
      "select multiple entire rows forwards",
      {
        ...INITIAL_STATE,
        active: Point.ORIGIN,
        selected: new EntireRowsSelection(Point.ORIGIN.row, Point.ORIGIN.row),
      },
      Actions.selectEntireRow(EXAMPLE_ROW, true),
      {
        ...INITIAL_STATE,
        active: Point.ORIGIN,
        selected: new EntireRowsSelection(Point.ORIGIN.row, EXAMPLE_ROW),
      },
    ],
    [
      "select multiple entire rows backwards",
      {
        ...INITIAL_STATE,
        selected: new EntireRowsSelection(EXAMPLE_ROW, EXAMPLE_ROW),
        active: EXAMPLE_POINT,
      },
      Actions.selectEntireRow(Point.ORIGIN.row, true),
      {
        ...INITIAL_STATE,
        selected: new EntireRowsSelection(Point.ORIGIN.row, EXAMPLE_ROW),
        active: EXAMPLE_POINT,
      },
    ],
    [
      "select an entire column",
      { ...INITIAL_STATE, active: Point.ORIGIN },
      Actions.selectEntireColumn(EXAMPLE_COLUMN, false),
      {
        ...INITIAL_STATE,
        active: { ...Point.ORIGIN, column: EXAMPLE_COLUMN },
        selected: new EntireColumnsSelection(EXAMPLE_COLUMN, EXAMPLE_COLUMN),
      },
    ],
    [
      "select multiple entire columns",
      {
        ...INITIAL_STATE,
        active: Point.ORIGIN,
        selected: new EntireColumnsSelection(
          Point.ORIGIN.column,
          Point.ORIGIN.column
        ),
      },
      Actions.selectEntireColumn(EXAMPLE_COLUMN, true),
      {
        ...INITIAL_STATE,
        active: Point.ORIGIN,
        selected: new EntireColumnsSelection(
          Point.ORIGIN.column,
          EXAMPLE_COLUMN
        ),
      },
    ],
    [
      "activate",
      INITIAL_STATE,
      Actions.activate(Point.ORIGIN),
      {
        ...INITIAL_STATE,
        active: Point.ORIGIN,
        selected: new RangeSelection(
          new PointRange(Point.ORIGIN, Point.ORIGIN)
        ),
      },
    ],
    [
      "setCellData",
      INITIAL_STATE,
      Actions.setCellData(Point.ORIGIN, EXAMPLE_CELL),
      {
        ...INITIAL_STATE,
        model: new Model(
          createFormulaParser,
          Matrix.set(Point.ORIGIN, EXAMPLE_CELL, INITIAL_STATE.model.data)
        ),
        lastChanged: Point.ORIGIN,
      },
    ],
    [
      "setCellDimensions",
      INITIAL_STATE,
      Actions.setCellDimensions(Point.ORIGIN, EXAMPLE_DIMENSIONS),
      {
        ...INITIAL_STATE,
        rowDimensions: {
          [Point.ORIGIN.row]: {
            height: EXAMPLE_DIMENSIONS.height,
            top: EXAMPLE_DIMENSIONS.top,
          },
        },
        columnDimensions: {
          [Point.ORIGIN.column]: {
            width: EXAMPLE_DIMENSIONS.width,
            left: EXAMPLE_DIMENSIONS.left,
          },
        },
      },
    ],
    ["edit", INITIAL_STATE, Actions.edit(), EDIT_STATE],
    ["view", EDIT_STATE, Actions.view(), INITIAL_STATE],
    [
      "blur",
      {
        ...INITIAL_STATE,
        active: Point.ORIGIN,
        selected: new RangeSelection(
          new PointRange(Point.ORIGIN, Point.ORIGIN)
        ),
      },
      Actions.blur(),
      INITIAL_STATE,
    ],
    [
      "dragStart",
      INITIAL_STATE,
      Actions.dragStart(),
      { ...INITIAL_STATE, dragging: true },
    ],
    [
      "dragEnd",
      { ...INITIAL_STATE, dragging: true },
      Actions.dragEnd(),
      INITIAL_STATE,
    ],
  ];
  test.each(cases)("%s", (name, state, action, expected) => {
    expect(reducer(state, action)).toEqual(expected);
  });
});

describe("hasKeyDownHandler", () => {
  const cases = [
    ["returns true for handled key", INITIAL_STATE, "Enter", true],
    ["returns false for handled key", INITIAL_STATE, "1", false],
    ["returns false for unhandled key in edit", EDIT_STATE, "Backspace", false],
    [
      "returns true for handled key in view unhandled in edit",
      INITIAL_STATE,
      "Backspace",
      true,
    ],
    ["returns false for unhandled key in edit", EDIT_STATE, "Delete", false],
    [
      "returns true for handled key in view unhandled in edit",
      INITIAL_STATE,
      "Delete",
      true,
    ],
  ] as const;
  test.each(cases)("%s", (name, state, key, expected) => {
    expect(hasKeyDownHandler(state, { key } as React.KeyboardEvent)).toBe(
      expected
    );
  });
});

describe("isActiveReadOnly", () => {
  const cases = [
    ["returns false if no active", INITIAL_STATE, false],
    [
      "returns false if active is not read only",
      { ...INITIAL_STATE, active: Point.ORIGIN },
      false,
    ],
    [
      "returns true if active is read only",
      {
        ...INITIAL_STATE,
        model: new Model(createFormulaParser, [
          [{ readOnly: true, value: undefined }],
        ]),
        active: Point.ORIGIN,
      },
      true,
    ],
  ] as const;
  test.each(cases)("%s", (name, state, expected) => {
    expect(isActiveReadOnly(state)).toBe(expected);
  });
});

describe("modifyEdge()", () => {
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
    expect(modifyEdge(selection, active, data, edge)).toEqual(expected);
  });
});

describe("modifyRangeSelectionEdge()", () => {
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
    expect(modifyRangeSelectionEdge(selection, active, data, edge)).toEqual(
      expected
    );
  });
});

describe("modifyEntireRowsSelection()", () => {
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
    expect(modifyEntireRowsSelection(selection, active, data, edge)).toEqual(
      expected
    );
  });
});

describe("modifyEntireColumnsSelection()", () => {
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
      new EntireColumnsSelection(0, 2),
    ],
  ];
  test.each(cases)("%s", (name, selection, active, data, edge, expected) => {
    expect(modifyEntireColumnsSelection(selection, active, data, edge)).toEqual(
      expected
    );
  });
});
