/**
 * @jest-environment jsdom
 */

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import Spreadsheet, { Props, SpreadsheetRef } from "./Spreadsheet";
import * as Matrix from "./matrix";
import * as Types from "./types";
import * as Point from "./point";
import { createEmptyMatrix } from "./util";
import { createFormulaParser } from "./engine";
import {
  EntireWorksheetSelection,
  EntireRowsSelection,
  EntireColumnsSelection,
  RangeSelection,
} from "./selection";
import { PointRange } from "./point-range";

type Value = string;
type CellType = Types.CellBase<Value>;

function areEntireColumnsSelectionsEqual(
  a: unknown,
  b: unknown
): boolean | undefined {
  const isAInstance = a instanceof EntireColumnsSelection;
  const isBInstance = b instanceof EntireColumnsSelection;

  if (isAInstance && isBInstance) {
    return a.equals(b);
  }
  if (isAInstance !== isBInstance) {
    return false;
  }
  return undefined;
}

function areEntireRowsSelectionsEqual(
  a: unknown,
  b: unknown
): boolean | undefined {
  const isAInstance = a instanceof EntireRowsSelection;
  const isBInstance = b instanceof EntireRowsSelection;
  if (isAInstance && isBInstance) {
    return a.equals(b);
  }
  if (isAInstance !== isBInstance) {
    return false;
  }
  return undefined;
}

function areEntireWorksheetSelectionsEqual(
  a: unknown,
  b: unknown
): boolean | undefined {
  const isAInstance = a instanceof EntireWorksheetSelection;
  const isBInstance = b instanceof EntireWorksheetSelection;
  if (isAInstance && isBInstance) {
    return true;
  }
  if (isAInstance !== isBInstance) {
    return false;
  }
  return undefined;
}

function areRangeSelectionsEqual(a: unknown, b: unknown): boolean | undefined {
  const isAInstance = a instanceof RangeSelection;
  const isBInstance = b instanceof RangeSelection;
  if (isAInstance && isBInstance) {
    return a.equals(b);
  }
  if (isAInstance !== isBInstance) {
    return false;
  }
  return undefined;
}

// @ts-expect-error
expect.addEqualityTesters([
  areEntireColumnsSelectionsEqual,
  areEntireRowsSelectionsEqual,
  areEntireWorksheetSelectionsEqual,
  areRangeSelectionsEqual,
]);

beforeEach(() => {
  jest.clearAllMocks();
});

const ROWS = 4;
const COLUMNS = 4;
const EXAMPLE_DATA = createEmptyMatrix<CellType>(ROWS, COLUMNS);
const EXAMPLE_PROPS: Props<CellType> = {
  data: EXAMPLE_DATA,
  onChange: jest.fn(),
  onEvaluatedDataChange: jest.fn(),
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
    const element = getSpreadsheetElement();
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
    const onSelect = jest.fn();
    render(
      <Spreadsheet
        {...EXAMPLE_PROPS}
        onActivate={onActivate}
        onSelect={onSelect}
      />
    );
    // Get elements
    const element = getSpreadsheetElement();
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
    expect(selected).not.toHaveClass("Spreadsheet__floating-rect--hidden");
    // Check onActivate is called
    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(onActivate).toHaveBeenCalledWith(Point.ORIGIN);
    // Check onSelect is called
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(
      new RangeSelection(new PointRange(Point.ORIGIN, Point.ORIGIN))
    );
  });
  test("pressing Enter when a cell is active enters to edit mode", () => {
    const onModeChange = jest.fn();
    render(<Spreadsheet {...EXAMPLE_PROPS} onModeChange={onModeChange} />);
    // Get elements
    const element = getSpreadsheetElement();
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
    const element = getSpreadsheetElement();
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
    const element = getSpreadsheetElement();
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
    const element = getSpreadsheetElement();
    fireEvent.keyDown(element, "Enter");
    expect(onKeyDown).toHaveBeenCalledTimes(1);
  });
  test("shift-click cell when a cell is activated selects a range of cells", async () => {
    const onSelect = jest.fn();
    render(<Spreadsheet {...EXAMPLE_PROPS} onSelect={onSelect} />);
    // Get elements
    const element = getSpreadsheetElement();
    const firstCell = safeQuerySelector(
      element,
      "tr:nth-of-type(2) td:nth-of-type(1)"
    );
    const thirdCell = safeQuerySelector(
      element,
      "tr:nth-of-type(3) td:nth-of-type(2)"
    );
    // Activate a cell
    fireEvent.mouseDown(firstCell);
    // Clear onSelect previous calls
    onSelect.mockClear();
    // Select range of cells
    fireEvent.mouseDown(thirdCell, {
      shiftKey: true,
    });
    // Check onSelect is called with the range of cells on selection
    expect(onSelect).toBeCalledTimes(1);
    expect(onSelect).toBeCalledWith(
      new RangeSelection(new PointRange(Point.ORIGIN, { row: 1, column: 1 }))
    );
  });
  test("setting row labels changes row indicators labels", () => {
    const EXAMPLE_ROW_LABELS = ["A", "B", "C", "D"];
    render(<Spreadsheet {...EXAMPLE_PROPS} rowLabels={EXAMPLE_ROW_LABELS} />);
    const element = getSpreadsheetElement();
    // Get row label elements.
    // Do not select from first row because it only contains corner and column indicators
    const rowLabelElements = element.querySelectorAll(
      "tr:not(:first-child) th"
    );
    const rowLabels = Array.from(
      rowLabelElements,
      (element) => element.textContent
    );
    expect(rowLabels).toEqual(EXAMPLE_ROW_LABELS);
  });
  test("setting column labels changes colum indicators labels", () => {
    const EXAMPLE_COLUMN_LABELS = ["First", "Second", "Third", "Fourth"];
    render(
      <Spreadsheet {...EXAMPLE_PROPS} columnLabels={EXAMPLE_COLUMN_LABELS} />
    );
    const element = getSpreadsheetElement();
    // Get column label elements.
    // Select from first row as it holds all the column indicators
    // Do not select first child as it is corner indicator
    const columnLabelElements = element.querySelectorAll(
      "tr:first-child th:not(:first-child)"
    );
    const columnLabels = Array.from(
      columnLabelElements,
      (element) => element.textContent
    );
    expect(columnLabels).toEqual(EXAMPLE_COLUMN_LABELS);
  });
  test("switching createFormulaParser", () => {
    const createFormulaParser1 = jest.fn(createFormulaParser);
    const createFormulaParser2 = jest.fn(createFormulaParser);
    const { rerender } = render(
      <Spreadsheet
        {...EXAMPLE_PROPS}
        createFormulaParser={createFormulaParser1}
      />
    );
    rerender(
      <Spreadsheet
        {...EXAMPLE_PROPS}
        createFormulaParser={createFormulaParser2}
      />
    );
    expect(createFormulaParser1).toHaveBeenCalledTimes(1);
    expect(createFormulaParser1).toHaveBeenCalledWith(EXAMPLE_PROPS.data);
    expect(createFormulaParser2).toHaveBeenCalledTimes(2);
    expect(createFormulaParser2).toHaveBeenCalledWith(EXAMPLE_PROPS.data);
  });

  test("formula cell referencing another formula cell", () => {
    render(
      <Spreadsheet
        data={[
          [{ value: 1 }, { value: 2 }, { value: "=A1+B1" }, { value: "=C1" }],
        ]}
      />
    );
    const element = getSpreadsheetElement();
    const cells = element.querySelectorAll("td");
    expect(cells.length).toBe(4);
    const [a1, b1, c1, d1] = cells;
    expect(a1.textContent).toBe("1");
    expect(b1.textContent).toBe("2");
    expect(c1.textContent).toBe("3");
    expect(d1.textContent).toBe("3");
  });
  test("select entire worksheet", () => {
    const handleSelect = jest.fn();
    render(<Spreadsheet {...EXAMPLE_PROPS} onSelect={handleSelect} />);
    const element = getSpreadsheetElement();
    const cornerIndicator = safeQuerySelector(element, "th");
    fireEvent.click(cornerIndicator);
    expect(handleSelect).toBeCalledWith(new EntireWorksheetSelection());
    expect(handleSelect).toBeCalledTimes(1);
  });
  test("select entire row", () => {
    const handleSelect = jest.fn();
    render(<Spreadsheet {...EXAMPLE_PROPS} onSelect={handleSelect} />);
    const element = getSpreadsheetElement();
    const rowIndicator = safeQuerySelector(
      element,
      "tr:nth-child(2) .Spreadsheet__header"
    );
    fireEvent.click(rowIndicator);
    expect(handleSelect).toBeCalledWith(new EntireRowsSelection(0, 0));
  });
  test("select entire rows", () => {
    const handleSelect = jest.fn();
    render(<Spreadsheet {...EXAMPLE_PROPS} onSelect={handleSelect} />);
    const element = getSpreadsheetElement();
    const firstRowIndicator = safeQuerySelector(
      element,
      "tr:nth-child(2) .Spreadsheet__header"
    );
    const secondRowIndicator = safeQuerySelector(
      element,
      "tr:nth-child(3) .Spreadsheet__header"
    );
    fireEvent.click(firstRowIndicator);
    handleSelect.mockClear();
    fireEvent.click(secondRowIndicator, {
      shiftKey: true,
    });
    expect(handleSelect).toBeCalledWith(new EntireRowsSelection(0, 1));
  });
  test("select entire column", () => {
    const handleSelect = jest.fn();
    render(<Spreadsheet {...EXAMPLE_PROPS} onSelect={handleSelect} />);
    const element = getSpreadsheetElement();
    const rowIndicator = safeQuerySelector(
      element,
      "tr:nth-child(1) .Spreadsheet__header:nth-child(2)"
    );
    fireEvent.click(rowIndicator);
    expect(handleSelect).toBeCalledWith(new EntireColumnsSelection(0, 0));
  });
  test("select entire columns", () => {
    const handleSelect = jest.fn();
    render(<Spreadsheet {...EXAMPLE_PROPS} onSelect={handleSelect} />);
    const element = getSpreadsheetElement();
    const firstColumnIndicator = safeQuerySelector(
      element,
      "tr:nth-child(1) .Spreadsheet__header:nth-child(2)"
    );
    const secondColumnIndicator = safeQuerySelector(
      element,
      "tr:nth-child(1) .Spreadsheet__header:nth-child(3)"
    );
    fireEvent.click(firstColumnIndicator);
    handleSelect.mockClear();
    fireEvent.click(secondColumnIndicator, {
      shiftKey: true,
    });
    expect(handleSelect).toBeCalledWith(new EntireColumnsSelection(0, 1));
  });
  test("controlled entire row selection", () => {
    render(
      <Spreadsheet
        {...EXAMPLE_PROPS}
        selected={new EntireRowsSelection(0, 0)}
      />
    );
    const element = getSpreadsheetElement();
    const selected = safeQuerySelector(
      element,
      ".Spreadsheet__floating-rect--selected"
    );
    expect(selected).not.toHaveClass("Spreadsheet__floating-rect--hidden");
  });
  test("controlled entire column selection", () => {
    render(
      <Spreadsheet
        {...EXAMPLE_PROPS}
        selected={new EntireRowsSelection(0, 0)}
      />
    );
    const element = getSpreadsheetElement();
    const selected = safeQuerySelector(
      element,
      ".Spreadsheet__floating-rect--selected"
    );
    expect(selected).not.toHaveClass("Spreadsheet__floating-rect--hidden");
  });
  test("controlled entire worksheet selection", () => {
    render(
      <Spreadsheet
        {...EXAMPLE_PROPS}
        selected={new EntireWorksheetSelection()}
      />
    );
    const element = getSpreadsheetElement();
    const selected = safeQuerySelector(
      element,
      ".Spreadsheet__floating-rect--selected"
    );
    expect(selected).not.toHaveClass("Spreadsheet__floating-rect--hidden");
  });
  test("auto fill handle is not rendered when no cell is selected", () => {
    render(<Spreadsheet {...EXAMPLE_PROPS} />);
    const element = getSpreadsheetElement();
    const autoFillHandle = element.querySelector(
      ".Spreadsheet__auto-fill-handle"
    );
    expect(autoFillHandle).toBeNull();
  });
  test("auto fill handle is rendered when a cell is selected", () => {
    render(<Spreadsheet {...EXAMPLE_PROPS} />);
    const element = getSpreadsheetElement();
    const cell = safeQuerySelector(element, "td");
    // Select a cell
    fireEvent.mouseDown(cell);
    // Check auto fill handle is rendered
    const autoFillHandle = safeQuerySelector(
      element,
      ".Spreadsheet__auto-fill-handle"
    );
    expect(autoFillHandle).toBeInTheDocument();
  });
  test("auto fill handle is rendered when a range is selected", () => {
    render(<Spreadsheet {...EXAMPLE_PROPS} />);
    const element = getSpreadsheetElement();
    const firstCell = safeQuerySelector(
      element,
      "tr:nth-of-type(2) td:nth-of-type(1)"
    );
    const thirdCell = safeQuerySelector(
      element,
      "tr:nth-of-type(3) td:nth-of-type(2)"
    );
    // Select first cell
    fireEvent.mouseDown(firstCell);
    // Extend selection to create a range
    fireEvent.mouseDown(thirdCell, { shiftKey: true });
    // Check auto fill handle is rendered
    const autoFillHandle = safeQuerySelector(
      element,
      ".Spreadsheet__auto-fill-handle"
    );
    expect(autoFillHandle).toBeInTheDocument();
  });
  test("mousedown on auto fill handle initiates auto fill mode", () => {
    render(<Spreadsheet {...EXAMPLE_PROPS} />);
    const element = getSpreadsheetElement();
    const cell = safeQuerySelector(element, "td");
    // Select a cell
    fireEvent.mouseDown(cell);
    // Get auto fill handle
    const autoFillHandle = safeQuerySelector(
      element,
      ".Spreadsheet__auto-fill-handle"
    );
    // Get selected floating rect
    const selected = safeQuerySelector(
      element,
      ".Spreadsheet__floating-rect--selected"
    );
    // Check auto filling class is not present initially
    expect(selected).not.toHaveClass(
      "Spreadsheet__floating-rect--auto-filling"
    );
    // Trigger auto fill
    fireEvent.mouseDown(autoFillHandle);
    // Check auto filling class is present
    expect(selected).toHaveClass("Spreadsheet__floating-rect--auto-filling");
  });
  test("auto fill continues numeric sequence 1, 2, 3", () => {
    const onChange = jest.fn();
    const data = createEmptyMatrix<CellType>(ROWS, COLUMNS);
    // Set up a numeric sequence: 1, 2
    const dataWithSequence = Matrix.set(
      { row: 0, column: 0 },
      { value: "1" },
      Matrix.set({ row: 1, column: 0 }, { value: "2" }, data)
    );
    render(<Spreadsheet data={dataWithSequence} onChange={onChange} />);
    const element = getSpreadsheetElement();
    // Select first cell (1)
    const firstCell = safeQuerySelector(
      element,
      "tr:nth-of-type(2) td:nth-of-type(1)"
    );
    fireEvent.mouseDown(firstCell);
    // Extend selection to second cell (2) to establish pattern
    const secondCell = safeQuerySelector(
      element,
      "tr:nth-of-type(3) td:nth-of-type(1)"
    );
    fireEvent.mouseDown(secondCell, { shiftKey: true });
    // Get auto fill handle
    const autoFillHandle = safeQuerySelector(
      element,
      ".Spreadsheet__auto-fill-handle"
    );
    // Start auto fill
    fireEvent.mouseDown(autoFillHandle);
    // Extend selection to include two more cells (simulating dragging down)
    const fourthCell = safeQuerySelector(
      element,
      "tr:nth-of-type(5) td:nth-of-type(1)"
    );
    fireEvent.mouseDown(fourthCell, { shiftKey: true });
    // End auto fill (trigger mouseup on window)
    fireEvent.mouseUp(window);
    // Check onChange was called with auto-filled data
    expect(onChange).toHaveBeenCalled();
    const resultData = onChange.mock.calls[
      onChange.mock.calls.length - 1
    ][0] as Matrix.Matrix<CellType>;
    // Verify the sequence: 1, 2, 3, 4
    expect(Matrix.get({ row: 0, column: 0 }, resultData)?.value).toBe("1");
    expect(Matrix.get({ row: 1, column: 0 }, resultData)?.value).toBe("2");
    expect(Matrix.get({ row: 2, column: 0 }, resultData)?.value).toBe(3);
    expect(Matrix.get({ row: 3, column: 0 }, resultData)?.value).toBe(4);
  });
});

describe("Spreadsheet Ref Methods", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("ref.activate activates the specified cell", () => {
    const onActivate = jest.fn();
    const ref = React.createRef<SpreadsheetRef>();

    render(
      <Spreadsheet {...EXAMPLE_PROPS} ref={ref} onActivate={onActivate} />
    );

    // Ensure ref is defined
    expect(ref.current).not.toBeNull();

    // Call activate method via ref
    const targetPoint = { row: 1, column: 1 };
    React.act(() => {
      ref.current?.activate(targetPoint);
    });

    // Verify onActivate was called with correct point
    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(onActivate).toHaveBeenCalledWith(targetPoint);
  });

  test("ref methods are memoized and stable between renders", () => {
    const ref = React.createRef<SpreadsheetRef>();
    const { rerender } = render(<Spreadsheet {...EXAMPLE_PROPS} ref={ref} />);

    // Store initial methods
    const initialActivate = ref.current?.activate;

    // Trigger re-render
    rerender(<Spreadsheet {...EXAMPLE_PROPS} ref={ref} />);

    // Methods should be referentially stable
    expect(ref.current?.activate).toBe(initialActivate);
  });

  test("activate method handles invalid points gracefully", () => {
    const onActivate = jest.fn();
    const ref = React.createRef<SpreadsheetRef>();

    render(
      <Spreadsheet {...EXAMPLE_PROPS} ref={ref} onActivate={onActivate} />
    );

    // Try to activate cell outside grid bounds
    const invalidPoint = { row: ROWS + 1, column: COLUMNS + 1 };
    React.act(() => {
      ref.current?.activate(invalidPoint);
    });

    // Should still call onActivate with the provided point
    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(onActivate).toHaveBeenCalledWith(invalidPoint);
  });

  test("ref is properly typed as SpreadsheetRef", () => {
    const ref = React.createRef<SpreadsheetRef>();

    render(<Spreadsheet {...EXAMPLE_PROPS} ref={ref} />);

    // TypeScript compilation would fail if ref typing is incorrect
    expect(typeof ref.current?.activate).toBe("function");
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

function getSpreadsheetElement(): Element {
  return safeQuerySelector(document, ".Spreadsheet");
}
