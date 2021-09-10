/**
 * @jest-environment jsdom
 */

import React from "react";
import { render } from "@testing-library/react";
import { Cell } from "./Cell";
import { Parser as FormulaParser } from "hot-formula-parser";

describe("<Cell />", () => {
  test("renders", () => {
    const mockDataViewer = jest.fn(() => null);
    const mockFormulaParser = {} as FormulaParser;
    const mockSelect = jest.fn();
    const mockActivate = jest.fn();
    const mockSetCellDimensions = jest.fn();
    render(
      <Cell
        row={0}
        column={0}
        DataViewer={mockDataViewer}
        formulaParser={mockFormulaParser}
        selected={false}
        active={false}
        copied={false}
        dragging={false}
        mode="view"
        data={{ value: null }}
        select={mockSelect}
        activate={mockActivate}
        setCellDimensions={mockSetCellDimensions}
      />
    );
    const element = document.querySelector(".Spreadsheet__cell");
    expect(element).not.toBeNull();
  });
});
