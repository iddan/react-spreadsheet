/**
 * @jest-environment jsdom
 */

import * as React from "react";
import { render } from "@testing-library/react";
import * as Point from "./point";
import * as Types from "./types";
import context from "./context";
import { INITIAL_STATE } from "./reducer";
import ActiveCell from "./ActiveCell";

const MOCK_DATA_EDITOR = jest.fn(() => null);
const DISPATCH_MOCK = jest.fn();
const GET_BINDINGS_FOR_CELL_MOCK = jest.fn();
const STATE_WITH_ACTIVE: Types.StoreState = {
  ...INITIAL_STATE,
  active: Point.ORIGIN,
  rowDimensions: {
    0: {
      height: 42,
      top: 42,
    },
  },
  columnDimensions: {
    0: {
      width: 42,
      left: 42,
    },
  },
};

describe("<ActiveCell />", () => {
  test("renders hidden when active is not defined", () => {
    render(
      <context.Provider value={[INITIAL_STATE, DISPATCH_MOCK]}>
        <ActiveCell
          DataEditor={MOCK_DATA_EDITOR}
          getBindingsForCell={GET_BINDINGS_FOR_CELL_MOCK}
        />
      </context.Provider>
    );
    expect(document.querySelector(".Spreadsheet__active-cell")).toBeNull();
    expect(MOCK_DATA_EDITOR).toBeCalledTimes(0);
  });
  test("renders when active is defined", () => {
    render(
      <context.Provider value={[STATE_WITH_ACTIVE, DISPATCH_MOCK]}>
        <ActiveCell
          DataEditor={MOCK_DATA_EDITOR}
          getBindingsForCell={GET_BINDINGS_FOR_CELL_MOCK}
        />
      </context.Provider>
    );
    const activeCell = document.querySelector(".Spreadsheet__active-cell");
    expect(activeCell).not.toBeNull();
    expect(activeCell).toHaveClass("Spreadsheet__active-cell--view");
    expect(MOCK_DATA_EDITOR).toBeCalledTimes(0);
  });
  test("renders in edit mode", () => {
    render(
      <context.Provider
        value={[{ ...STATE_WITH_ACTIVE, mode: "edit" }, DISPATCH_MOCK]}
      >
        <ActiveCell
          DataEditor={MOCK_DATA_EDITOR}
          getBindingsForCell={GET_BINDINGS_FOR_CELL_MOCK}
        />
      </context.Provider>
    );
    const activeCell = document.querySelector(".Spreadsheet__active-cell");
    expect(activeCell).not.toBeNull();
    expect(activeCell).toHaveClass("Spreadsheet__active-cell--edit");
    expect(MOCK_DATA_EDITOR).toBeCalledTimes(1);
    expect(MOCK_DATA_EDITOR).toBeCalledWith(
      {
        row: Point.ORIGIN.row,
        column: Point.ORIGIN.column,
        cell: undefined,
        onChange: expect.any(Function),
        exitEditMode: expect.any(Function),
      },
      {}
    );
  });
});
