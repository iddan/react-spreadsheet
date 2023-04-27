import * as React from "react";
import * as Types from "./types";
import * as Actions from "./actions";
import reducer, {
  INITIAL_STATE,
  hasKeyDownHandler,
  isActiveReadOnly,
} from "./reducer";
import { createEmptyMatrix } from "./util";
import * as Point from "./point";
import * as Matrix from "./matrix";
import * as PointRange from "./point-range";
import * as Selection from "./selection";
import "./areModelsEqual";
import { Model } from "./engine";

const EDIT_STATE: Types.StoreState = { ...INITIAL_STATE, mode: "edit" };
const EXAMPLE_DATA = createEmptyMatrix<Types.CellBase>(4, 4);
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
      { ...INITIAL_STATE, model: new Model(EXAMPLE_DATA) },
    ],
    [
      "select",
      { ...INITIAL_STATE, active: Point.ORIGIN },
      Actions.select(EXAMPLE_POINT),
      {
        ...INITIAL_STATE,
        active: Point.ORIGIN,
        selected: PointRange.create(Point.ORIGIN, EXAMPLE_POINT),
      },
    ],
    [
      "select an entire table",
      INITIAL_STATE,
      Actions.selectEntireTable(),
      {
        ...INITIAL_STATE,
        active: Point.ORIGIN,
        selected: Selection.createEntireTable(),
      },
    ],
    [
      "select an entire row",
      { ...INITIAL_STATE, active: Point.ORIGIN },
      Actions.selectEntireRow(EXAMPLE_ROW, false),
      {
        ...INITIAL_STATE,
        active: { ...Point.ORIGIN, row: EXAMPLE_ROW },
        selected: Selection.createEntireRows(EXAMPLE_ROW, EXAMPLE_ROW),
      },
    ],
    [
      "select multiple entire rows forwards",
      {
        ...INITIAL_STATE,
        active: Point.ORIGIN,
        selected: Selection.createEntireRows(
          Point.ORIGIN.row,
          Point.ORIGIN.row
        ),
      },
      Actions.selectEntireRow(EXAMPLE_ROW, true),
      {
        ...INITIAL_STATE,
        active: Point.ORIGIN,
        selected: Selection.createEntireRows(Point.ORIGIN.row, EXAMPLE_ROW),
      },
    ],
    [
      "select multiple entire rows backwards",
      {
        ...INITIAL_STATE,
        selected: Selection.createEntireRows(EXAMPLE_ROW, EXAMPLE_ROW),
        active: EXAMPLE_POINT,
      },
      Actions.selectEntireRow(Point.ORIGIN.row, true),
      {
        ...INITIAL_STATE,
        selected: Selection.createEntireRows(Point.ORIGIN.row, EXAMPLE_ROW),
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
        selected: Selection.createEntireColumns(EXAMPLE_COLUMN, EXAMPLE_COLUMN),
      },
    ],
    [
      "select multiple entire columns",
      {
        ...INITIAL_STATE,
        active: Point.ORIGIN,
        selected: Selection.createEntireColumns(
          Point.ORIGIN.column,
          Point.ORIGIN.column
        ),
      },
      Actions.selectEntireColumn(EXAMPLE_COLUMN, true),
      {
        ...INITIAL_STATE,
        active: Point.ORIGIN,
        selected: Selection.createEntireColumns(
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
        selected: PointRange.create(Point.ORIGIN, Point.ORIGIN),
      },
    ],
    [
      "setCellData",
      INITIAL_STATE,
      Actions.setCellData(Point.ORIGIN, EXAMPLE_CELL),
      {
        ...INITIAL_STATE,
        model: new Model(
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
        selected: PointRange.create(Point.ORIGIN, Point.ORIGIN),
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
        model: new Model([[{ readOnly: true, value: undefined }]]),
        active: Point.ORIGIN,
      },
      true,
    ],
  ] as const;
  test.each(cases)("%s", (name, state, expected) => {
    expect(isActiveReadOnly(state)).toBe(expected);
  });
});
