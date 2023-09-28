/**
 * @jest-environment jsdom
 */

import * as React from "react";
import { fireEvent, render } from "@testing-library/react";
import * as Point from "./point";
import * as Types from "./types";
import * as Actions from "./actions";
import context from "./context";
import { INITIAL_STATE } from "./reducer";
import ActiveCell from "./ActiveCell";
import DataEditor from "./DataEditor";

const MOCK_DATA_EDITOR = jest.fn(() => null);
const DISPATCH_MOCK = jest.fn();
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
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test("renders hidden when active is not defined", () => {
    render(
      <context.Provider value={[INITIAL_STATE, DISPATCH_MOCK]}>
        <ActiveCell DataEditor={MOCK_DATA_EDITOR} />
      </context.Provider>
    );
    expect(document.querySelector(".Spreadsheet__active-cell")).toBeNull();
    expect(MOCK_DATA_EDITOR).toBeCalledTimes(0);
  });
  test("renders when active is defined", () => {
    render(
      <context.Provider value={[STATE_WITH_ACTIVE, DISPATCH_MOCK]}>
        <ActiveCell DataEditor={MOCK_DATA_EDITOR} />
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
        <ActiveCell DataEditor={MOCK_DATA_EDITOR} />
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
  test("calls setCellData if value changed", () => {
    const { rerender } = render(
      <context.Provider
        value={[{ ...STATE_WITH_ACTIVE, mode: "edit" }, DISPATCH_MOCK]}
      >
        <ActiveCell DataEditor={DataEditor} />
      </context.Provider>
    );
    const activeCell = document.querySelector(".Spreadsheet__active-cell");
    expect(activeCell).not.toBeNull();
    expect(activeCell).toHaveClass("Spreadsheet__active-cell--edit");
    const input = activeCell?.querySelector("input");
    if (!input) throw new Error("input not found");
    fireEvent.change(input, { target: { value: "test" } });
    expect(DISPATCH_MOCK).toBeCalledTimes(1);
    expect(DISPATCH_MOCK).toBeCalledWith(
      Actions.setCellData(Point.ORIGIN, {
        value: "test",
      })
    );
    rerender(
      <context.Provider
        value={[{ ...STATE_WITH_ACTIVE, mode: "view" }, DISPATCH_MOCK]}
      >
        <ActiveCell DataEditor={DataEditor} />
      </context.Provider>
    );
    expect(activeCell).not.toHaveClass("Spreadsheet__active-cell--edit");
  });
  test("doesn't call setCellData if value not changed", () => {
    const { rerender } = render(
      <context.Provider
        value={[{ ...STATE_WITH_ACTIVE, mode: "edit" }, DISPATCH_MOCK]}
      >
        <ActiveCell DataEditor={MOCK_DATA_EDITOR} />
      </context.Provider>
    );
    const activeCell = document.querySelector(".Spreadsheet__active-cell");
    expect(activeCell).not.toBeNull();
    expect(activeCell).toHaveClass("Spreadsheet__active-cell--edit");
    rerender(
      <context.Provider
        value={[{ ...STATE_WITH_ACTIVE, mode: "view" }, DISPATCH_MOCK]}
      >
        <ActiveCell DataEditor={MOCK_DATA_EDITOR} />
      </context.Provider>
    );
    expect(DISPATCH_MOCK).toBeCalledTimes(0);
    expect(activeCell).not.toHaveClass("Spreadsheet__active-cell--edit");
  });
});
