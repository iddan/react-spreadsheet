/**
 * @jest-environment jsdom
 */

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
    // Get elements
    const element = safeQuerySelector(document, ".Spreadsheet");
    const table = safeQuerySelector(element, "table.Spreadsheet__table");
    const selected = safeQuerySelector(
      element,
      ".Spreadsheet__floating-rect--selected"
    );
    const copied = safeQuerySelector(
      element,
      ".Spreadsheet__floating-rect--copied"
    );
    // Check all sub elements are rendered correctly
    const trs = table.querySelectorAll("tr");
    expect(trs).toHaveLength(ROWS + 1);
    const tds = table.querySelectorAll("tr td.Spreadsheet__cell");
    expect(tds).toHaveLength(ROWS * COLUMNS);
    const ths = table.querySelectorAll("tr th.Spreadsheet__header");
    expect(ths).toHaveLength(ROWS + COLUMNS + 1);
    // Check active cell is not rendered
    expect(element.querySelector(".Spreadsheet__active-cell")).toBeNull();
    // Make sure selected is hidden
    expect(selected).toHaveClass("Spreadsheet__floating-rect--hidden");
    // Make sure copied is hidden
    expect(copied).toHaveClass("Spreadsheet__floating-rect--hidden");
  });
  test("click activates cell", () => {
    const onActivate = jest.fn();
    render(<Spreadsheet {...EXAMPLE_PROPS} onActivate={onActivate} />);
    // Get elements
    const element = safeQuerySelector(document, ".Spreadsheet");
    const cell = safeQuerySelector(element, "td");
    const selected = safeQuerySelector(
      element,
      ".Spreadsheet__floating-rect--selected"
    );
    // Select a cell
    fireEvent.mouseDown(cell);
    // Get active cell
    const activeCell = safeQuerySelector(element, ".Spreadsheet__active-cell");
    expect(activeCell).toHaveClass("Spreadsheet__active-cell--view");
    expect(cell.getBoundingClientRect()).toEqual(
      activeCell?.getBoundingClientRect()
    );
    // Check selected is not hidden
    expect(selected).toHaveClass("Spreadsheet__floating-rect--hidden");
    // Check onActivate is called
    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(onActivate).toHaveBeenCalledWith(Point.ORIGIN);
  });
  test("pressing Enter when a cell is active enters to edit mode", () => {
    const onModeChange = jest.fn();
    render(<Spreadsheet {...EXAMPLE_PROPS} onModeChange={onModeChange} />);
    // Get elements
    const element = safeQuerySelector(document, ".Spreadsheet");
    const cell = safeQuerySelector(element, "td");
    // Select cell
    fireEvent.mouseDown(cell);
    // Get active cell
    const activeCell = safeQuerySelector(element, ".Spreadsheet__active-cell");
    // Press Enter
    fireEvent.keyDown(activeCell, {
      key: "Enter",
    });
    // Check mode has changed to edit
    expect(activeCell).toHaveClass("Spreadsheet__active-cell--edit");
    // Get input
    const input = safeQuerySelector(activeCell, "input");
    expect(input).toHaveFocus();
    // Check onModeChange is called
    expect(onModeChange).toHaveBeenCalledTimes(1);
    expect(onModeChange).toHaveBeenCalledWith("edit");
  });
  test("input triggers onChange", () => {
    render(<Spreadsheet {...EXAMPLE_PROPS} />);
    // Get elements
    const element = safeQuerySelector(document, ".Spreadsheet");
    const cell = safeQuerySelector(element, "td");
    // Select cell
    fireEvent.mouseDown(cell);
    // Get active cell
    const activeCell = safeQuerySelector(element, ".Spreadsheet__active-cell");
    // Press Enter
    fireEvent.keyDown(activeCell, {
      key: "Enter",
    });
    // Get input
    const input = safeQuerySelector(activeCell, "input");
    // Change input
    fireEvent.change(input, {
      target: {
        value: EXAMPLE_VALUE,
      },
    });
    // Check onChange is called
    expect(EXAMPLE_PROPS.onChange).toBeCalledTimes(1);
    expect(EXAMPLE_PROPS.onChange).toBeCalledWith(EXAMPLE_MODIFIED_DATA);
  });
  test("handles external change of data correctly", () => {
    const { rerender } = render(<Spreadsheet {...EXAMPLE_PROPS} />);
    rerender(<Spreadsheet {...EXAMPLE_PROPS} data={EXAMPLE_MODIFIED_DATA} />);
    // Get text span
    const matchingElements = screen.getAllByText(EXAMPLE_CELL.value);
    expect(matchingElements).toHaveLength(1);
    const [textSpan] = matchingElements;
    // Get cell
    const cell = textSpan.parentElement;
    expectNotToBeNull(cell);
    // Get row
    const row = cell.parentElement;
    expectNotToBeNull(row);
    // Make sure the cell is in the right column
    expect(getHTMLCollectionIndexOf(row.children, cell)).toBe(1);
    // Get table
    const table = row.parentElement;
    expectNotToBeNull(table);
    // Make sure the cell is in the right row
    expect(getHTMLCollectionIndexOf(table.children, row)).toBe(1);
  });
  test("renders class name", () => {
    const EXAMPLE_CLASS_NAME = "EXAMPLE_CLASS_NAME";
    render(<Spreadsheet {...EXAMPLE_PROPS} className={EXAMPLE_CLASS_NAME} />);
    const element = safeQuerySelector(document, ".Spreadsheet");
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
    const element = safeQuerySelector(document, ".Spreadsheet");
    fireEvent.keyDown(element, "Enter");
    expect(onKeyDown).toHaveBeenCalledTimes(1);
  });
  test("calls onSelect on select", async () => {
    const onSelect = jest.fn();
    render(<Spreadsheet {...EXAMPLE_PROPS} onSelect={onSelect} />);
    // Get elements
    const element = safeQuerySelector(document, ".Spreadsheet");
    const firstCell = safeQuerySelector(element, "td:nth-of-type(1)");
    const thirdCell = safeQuerySelector(element, "td:nth-of-type(3)");
    // Activate a cell
    fireEvent.mouseDown(firstCell);
    // Check onSelect is called on activation with the activated cell
    expect(onSelect).toBeCalledTimes(1);
    expect(onSelect).toBeCalledWith([Point.ORIGIN]);
    onSelect.mockClear();
    // Select range of cells
    fireEvent.mouseDown(thirdCell, {
      shiftKey: true,
    });
    // Check onSelect is called with the range of cells on selection
    expect(onSelect).toBeCalledTimes(1);
    expect(onSelect).toBeCalledWith([
      { row: 0, column: 0 },
      { row: 0, column: 1 },
      { row: 0, column: 2 },
    ]);
  });
});

/** Like .querySelector() but throws for no match */
function safeQuerySelector<T extends Element = Element>(
  node: ParentNode,
  selector: string
): T {
  const element = node.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Selector ${selector} has no matching elements`);
  }
  return element;
}

/** Wrapper for expect(actual).not.toBeNull() with type assertion */
function expectNotToBeNull<T>(
  actual: T | null | undefined
): asserts actual is T {
  expect(actual).not.toBe(null);
}

/** Like index of for HTMLCollection */
function getHTMLCollectionIndexOf(
  collection: HTMLCollection,
  element: Element
): number {
  const items = Array.from(collection);
  return items.indexOf(element);
}
