/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import * as Types from "./types";
import ColumnIndicator from "./ColumnIndicator";

const EXAMPLE_PROPS: Types.ColumnIndicatorProps = {
  column: 0,
  selected: false,
  onSelect: jest.fn(),
};

describe("<ColumnIndicator />", () => {
  test("renders with column letter", () => {
    render(<ColumnIndicator {...EXAMPLE_PROPS} />);
    expect(document.querySelectorAll("th.Spreadsheet__header").length).toBe(1);
    expect(screen.queryByText("A")).not.toBeNull();
  });
  test("renders with label", () => {
    render(<ColumnIndicator {...EXAMPLE_PROPS} label="Example Label" />);
    expect(document.querySelectorAll("th.Spreadsheet__header").length).toBe(1);
    expect(screen.queryByText("Example Label")).not.toBeNull();
  });
  test("calls onSelect", () => {
    render(<ColumnIndicator {...EXAMPLE_PROPS} />);
    expect(document.querySelectorAll("th.Spreadsheet__header").length).toBe(1);
    const indicator = document.querySelector(
      "th.Spreadsheet__header"
    ) as HTMLTableCellElement;
    indicator.click();
    expect(EXAMPLE_PROPS.onSelect).toBeCalledTimes(1);
  });
});
