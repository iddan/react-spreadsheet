/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, getAllByText } from "@testing-library/react";
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
};
const EXAMPLE_CELL: CellType = { value: "EXAMPLE_VALUE" };
const EXAMPLE_MODIFIED_DATA = Matrix.set(
  Point.ORIGIN,
  EXAMPLE_CELL,
  EXAMPLE_DATA
);

describe("<Spreadsheet />", () => {
  test("renders", () => {
    render(<Spreadsheet {...EXAMPLE_PROPS} />);
    const element = document.querySelector(".Spreadsheet");
    expect(element).not.toBeNull();
    const table = document.querySelector(
      ".Spreadsheet table.Spreadsheet__table"
    );
    expect(table).not.toBeNull();
    const trs = document.querySelectorAll(".Spreadsheet table tr");
    expect(trs.length).toBe(ROWS + 1);
    const tds = document.querySelectorAll(
      ".Spreadsheet table.Spreadsheet__table tr td.Spreadsheet__cell"
    );
    expect(tds.length).toBe(ROWS * COLUMNS);
    const ths = document.querySelectorAll(
      ".Spreadsheet table.Spreadsheet__table tr th.Spreadsheet__header"
    );
    expect(ths.length).toBe(ROWS + COLUMNS + 1);
  });
  test("handles external change of data correctly", () => {
    const onChange = jest.fn();
    const { rerender } = render(
      <Spreadsheet {...EXAMPLE_PROPS} onChange={onChange} />
    );
    rerender(
      <Spreadsheet
        {...EXAMPLE_PROPS}
        data={EXAMPLE_MODIFIED_DATA}
        onChange={onChange}
      />
    );
    const element = document.querySelector<HTMLElement>(".Spreadsheet");
    expect(element).not.toBeNull();
    if (!element) {
      throw new Error("element must be defined");
    }
    const matchingCells = getAllByText(element, EXAMPLE_CELL.value);
    expect(matchingCells.length).toBe(1);
    const [textSpan] = matchingCells;
    expect(textSpan).not.toBeNull();
    expect(onChange).toBeCalledTimes(0);
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
