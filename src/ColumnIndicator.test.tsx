/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import ColumnIndicator, { Props } from "./ColumnIndicator";

const EXAMPLE_PROPS: Props = {
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
});
