/**
 * @jest-environment jsdom
 */

import React from "react";
import { fireEvent, render } from "@testing-library/react";
import Spreadsheet, { Props } from "./Spreadsheet";
import * as Types from "./types";
import { createEmptyMatrix } from "./util";

beforeEach(() => {
  jest.clearAllMocks();
});

const ROWS = 4;
const COLUMNS = 4;

const EXAMPLE_PROPS: Props<Types.CellBase<number>> = {
  data: createEmptyMatrix(ROWS, COLUMNS),
};

describe("<Spreadsheet />", () => {
  test("renders", () => {
    render(<Spreadsheet {...EXAMPLE_PROPS} />);
    const element = document.querySelector(".Spreadsheet");
    expect(element).not.toBeNull();
    const table = document.querySelector(".Spreadsheet table");
    expect(table).not.toBeNull();
    const trs = document.querySelectorAll(".Spreadsheet table tr");
    expect(trs.length).toBe(ROWS + 1);
    const tds = document.querySelectorAll(".Spreadsheet table tr td");
    expect(tds.length).toBe(ROWS * COLUMNS);
    const ths = document.querySelectorAll(".Spreadsheet table tr th");
    expect(ths.length).toBe(ROWS + COLUMNS + 1);
  });
});
