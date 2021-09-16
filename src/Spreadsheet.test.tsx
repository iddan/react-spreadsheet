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
    if (!element) {
      throw new Error("element must be defined");
    }
    const table = element.querySelector("table.Spreadsheet__table");
    if (!table) {
      throw new Error("table must be defined");
    }
    const trs = table.querySelectorAll("tr");
    expect(trs).toHaveLength(ROWS + 1);
    const tds = table.querySelectorAll("tr td.Spreadsheet__cell");
    expect(tds).toHaveLength(ROWS * COLUMNS);
    const ths = table.querySelectorAll("tr th.Spreadsheet__header");
    expect(ths).toHaveLength(ROWS + COLUMNS + 1);
    // Make sure active cell is not rendered before a cell is activated
    expect(element.querySelector(".Spreadsheet__active-cell")).toBeNull();
    // Make sure selected is hidden
    expect(
      element.querySelector(
        ".Spreadsheet__floating-rect.Spreadsheet__floating-rect--selected.Spreadsheet__floating-rect--hidden"
      )
    ).not.toBeNull();
    // Make sure copied is hidden
    expect(
      element.querySelector(
        ".Spreadsheet__floating-rect.Spreadsheet__floating-rect--copied.Spreadsheet__floating-rect--hidden"
      )
    ).not.toBeNull();
  });
  test("input triggers onChange", () => {
    render(<Spreadsheet {...EXAMPLE_PROPS} />);
    const element = document.querySelector(".Spreadsheet");
    if (!element) {
      throw new Error("element must be defined");
    }
    const cell = element.querySelector("td");
    if (!cell) {
      throw new Error("cell must be defined");
    }
    fireEvent.mouseDown(cell);
    const activeCell = element.querySelector(
      ".Spreadsheet__active-cell.Spreadsheet__active-cell--view"
    );
    if (!activeCell) {
      throw new Error("active cell must be defined");
    }
    fireEvent.keyDown(activeCell, {
      key: "Enter",
    });
    expect(activeCell).toHaveClass("Spreadsheet__active-cell--edit");
    const input = activeCell.querySelector("input");
    if (!input) {
      throw new Error("input must be defined");
    }
    expect(input).toHaveFocus();
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
    expect(textSpan).not.toBeNull();
    expect(EXAMPLE_PROPS.onChange).toBeCalledTimes(0);
    if (!textSpan.parentElement) {
      throw new Error("textSpan must have a parent element");
    }
    const cell = textSpan.parentElement;
    if (!cell.parentElement) {
      throw new Error("cell must have a parent element");
    }
    const row = cell.parentElement;
    const rowChildren = Array.from(row.children);
    // Make sure the cell is in the right column
    expect(rowChildren.indexOf(cell)).toBe(1);
    if (!row.parentElement) {
      throw new Error("row must have a parent element");
    }
    const table = row.parentElement;
    const tableChildren = Array.from(table.children);
    // Make sure the cell is in the right row
    expect(tableChildren.indexOf(row)).toBe(1);
  });
});
