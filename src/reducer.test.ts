import * as React from "react";
import { Action } from "@reduxjs/toolkit";
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
import * as PointMap from "./point-map";
import * as PointSet from "./point-set";

const EDIT_STATE: Types.StoreState = { ...INITIAL_STATE, mode: "edit" };
const EXAMPLE_DATA = createEmptyMatrix<Types.CellBase>(4, 4);
const EXAMPLE_POINT: Point.Point = { row: 2, column: 2 };
const EXAMPLE_CELL: Types.CellBase = { value: 42 };
const MOCK_GET_BINDINGS_FOR_CELL = jest.fn(() => []);
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
      action: Action<unknown>,
      expected: Types.StoreState
    ]
  > = [
    [
      "setData",
      INITIAL_STATE,
      Actions.setData(EXAMPLE_DATA),
      { ...INITIAL_STATE, data: EXAMPLE_DATA },
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
      Actions.setCellData(
        Point.ORIGIN,
        EXAMPLE_CELL,
        MOCK_GET_BINDINGS_FOR_CELL
      ),
      {
        ...INITIAL_STATE,
        data: Matrix.set(Point.ORIGIN, EXAMPLE_CELL, INITIAL_STATE.data),
        bindings: PointMap.from([[Point.ORIGIN, PointSet.from([])]]),
        mode: "edit",
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
      { ...INITIAL_STATE, active: Point.ORIGIN },
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
        data: [
          [{ readOnly: true, value: undefined }],
        ] as Matrix.Matrix<Types.CellBase>,
        active: Point.ORIGIN,
      },
      true,
    ],
  ] as const;
  test.each(cases)("%s", (name, state, expected) => {
    expect(isActiveReadOnly(state)).toBe(expected);
  });
});
