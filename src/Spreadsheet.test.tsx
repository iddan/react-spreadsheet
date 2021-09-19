/**
 * @jest-environment jsdom
 */

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import Spreadsheet, { Props } from "./Spreadsheet";
import * as Matrix from "./matrix";
import * as Types from "./types";
import * as Point from "./point";
import { createEmptyMatrix } from "./util";

type Value = string;
type CellType = Types.CellBase<Value>;

beforeEach(() => {
  jest.clearAllMocks();
});

const ROWS = 4;
const COLUMNS = 4;
const EXAMPLE_DATA = createEmptyMatrix<CellType>(ROWS, COLUMNS);
const EXAMPLE_PROPS: Props<CellType> = {
  data: EXAMPLE_DATA,
  onChange: jest.fn(),
};
const EXAMPLE_VALUE: Value = "EXAMPLE_VALUE";
const EXAMPLE_CELL: CellType = { value: EXAMPLE_VALUE };
const EXAMPLE_MODIFIED_DATA = Matrix.set(
  Point.ORIGIN,
  EXAMPLE_CELL,
  EXAMPLE_DATA
);

beforeAll(() => {
  jest.clearAllMocks();
});

describe("<Spreadsheet />", () => {
  test("renders", () => {
    render(<Spreadsheet {...EXAMPLE_PROPS} />);
    const element = document.querySelector(".Spreadsheet");
    expectNotToBeNull(element);
    const table = element.querySelector("table.Spreadsheet__table");
    expectNotToBeNull(table);
    const trs = table.querySelectorAll("tr");
    expect(trs).toHaveLength(ROWS + 1);
    const tds = table.querySelectorAll("tr td.Spreadsheet__cell");
    expect(tds).toHaveLength(ROWS * COLUMNS);
    const ths = table.querySelectorAll("tr th.Spreadsheet__header");
    expect(ths).toHaveLength(ROWS + COLUMNS + 1);
    // Make sure active cell is not rendered before a cell is activated
    expect(element.querySelector(".Spreadsheet__active-cell")).toBeNull();
    // Make sure selected is hidden
    expectNotToBeNull(
      element.querySelector(
        ".Spreadsheet__floating-rect.Spreadsheet__floating-rect--selected.Spreadsheet__floating-rect--hidden"
      )
    );
    // Make sure copied is hidden
    expectNotToBeNull(
      element.querySelector(
        ".Spreadsheet__floating-rect.Spreadsheet__floating-rect--copied.Spreadsheet__floating-rect--hidden"
      )
    );
  });
  test("click activates cell", () => {
    const onActivate = jest.fn();
    render(<Spreadsheet {...EXAMPLE_PROPS} onActivate={onActivate} />);
    const element = document.querySelector(".Spreadsheet");
    expectNotToBeNull(element);
    const cell = element.querySelector("td");
    expectNotToBeNull(cell);
    expect(element.querySelector(".Spreadsheet__active-cell")).toBeNull();
    fireEvent.mouseDown(cell);
    const activeCell = element.querySelector(".Spreadsheet__active-cell");
    const selected = element.querySelector(
      ".Spreadsheet__floating-rect--selected"
    );
    expect(activeCell).toHaveClass("Spreadsheet__active-cell--view");
    expectNotToBeNull(activeCell);
    expect(cell.getBoundingClientRect()).toEqual(
      activeCell?.getBoundingClientRect()
    );
    expect(selected).toHaveClass("Spreadsheet__floating-rect--hidden");
    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(onActivate).toHaveBeenCalledWith(Point.ORIGIN);
  });
  test("pressing Enter when a cell is active enters to edit mode", () => {
    const onModeChange = jest.fn();
    render(<Spreadsheet {...EXAMPLE_PROPS} onModeChange={onModeChange} />);
    const element = document.querySelector(".Spreadsheet");
    const cell = element?.querySelector("td");
    expectNotToBeNull(cell);
    fireEvent.mouseDown(cell);
    const activeCell = element?.querySelector(".Spreadsheet__active-cell");
    expectNotToBeNull(activeCell);
    fireEvent.keyDown(activeCell, {
      key: "Enter",
    });
    // Check mode has changed to edit
    expect(activeCell).toHaveClass("Spreadsheet__active-cell--edit");
    const input = activeCell.querySelector("input");
    expectNotToBeNull(input);
    expect(input).toHaveFocus();
    expect(onModeChange).toHaveBeenCalledTimes(1);
    expect(onModeChange).toHaveBeenCalledWith("edit");
  });
  test("input triggers onChange", () => {
    render(<Spreadsheet {...EXAMPLE_PROPS} />);
    const element = document.querySelector(".Spreadsheet");
    const cell = element?.querySelector("td");
    expectNotToBeNull(cell);
    fireEvent.mouseDown(cell);
    const activeCell = element?.querySelector(".Spreadsheet__active-cell");
    expectNotToBeNull(activeCell);
    fireEvent.keyDown(activeCell, {
      key: "Enter",
    });
    const input = activeCell.querySelector("input");
    expectNotToBeNull(input);
    fireEvent.change(input, {
      target: {
        value: EXAMPLE_VALUE,
      },
    });
    expect(EXAMPLE_PROPS.onChange).toBeCalledTimes(1);
    expect(EXAMPLE_PROPS.onChange).toBeCalledWith(EXAMPLE_MODIFIED_DATA);
  });
  test("handles external change of data correctly", () => {
    const { rerender } = render(<Spreadsheet {...EXAMPLE_PROPS} />);
    rerender(<Spreadsheet {...EXAMPLE_PROPS} data={EXAMPLE_MODIFIED_DATA} />);
    const matchingCells = screen.getAllByText(EXAMPLE_CELL.value);
    expect(matchingCells).toHaveLength(1);
    const [textSpan] = matchingCells;
    expectNotToBeNull(textSpan);
    expect(EXAMPLE_PROPS.onChange).toBeCalledTimes(0);
    expectNotToBeNull(textSpan.parentElement);
    const cell = textSpan.parentElement;
    expectNotToBeNull(cell.parentElement);
    const row = cell.parentElement;
    const rowChildren = Array.from(row.children);
    // Make sure the cell is in the right column
    expect(rowChildren.indexOf(cell)).toBe(1);
    expectNotToBeNull(row.parentElement);
    const table = row.parentElement;
    const tableChildren = Array.from(table.children);
    // Make sure the cell is in the right row
    expect(tableChildren.indexOf(row)).toBe(1);
  });
  test("renders class name", () => {
    const EXAMPLE_CLASS_NAME = "EXAMPLE_CLASS_NAME";
    render(<Spreadsheet {...EXAMPLE_PROPS} className={EXAMPLE_CLASS_NAME} />);
    const element = document.querySelector(".Spreadsheet");
    expect(element).toHaveClass(EXAMPLE_CLASS_NAME);
  });
  test("setting hideColumnIndicators hides column indicators", () => {
    render(<Spreadsheet {...EXAMPLE_PROPS} hideColumnIndicators />);
    const ths = document.querySelectorAll(".Spreadsheet th");
    expect(ths).toHaveLength(ROWS);
  });
  test("setting hideRowIndicatos hides row indicators", () => {
    render(<Spreadsheet {...EXAMPLE_PROPS} hideRowIndicators />);
    const ths = document.querySelectorAll(".Spreadsheet th");
    expect(ths).toHaveLength(COLUMNS);
  });
  test("calls onKeyDown on key down", () => {
    const onKeyDown = jest.fn();
    render(<Spreadsheet {...EXAMPLE_PROPS} onKeyDown={onKeyDown} />);
    const element = document.querySelector(".Spreadsheet");
    expectNotToBeNull(element);
    fireEvent.keyDown(element, "Enter");
    expect(onKeyDown).toHaveBeenCalledTimes(1);
  });
});

function expectNotToBeNull<T>(
  actual: T | null | undefined
): asserts actual is T {
  expect(actual).not.toBe(null);
}
