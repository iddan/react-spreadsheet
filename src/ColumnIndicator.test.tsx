/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import ColumnIndicator from "./ColumnIndicator";

describe("<ColumnIndicator />", () => {
  test("renders with column letter", () => {
    render(<ColumnIndicator column={0} />);
    expect(document.querySelectorAll("th.Spreadsheet__header").length).toBe(1);
    expect(screen.queryByText("A")).not.toBeNull();
  });
  test("renders with label", () => {
    render(<ColumnIndicator column={0} label="Example Label" />);
    expect(document.querySelectorAll("th.Spreadsheet__header").length).toBe(1);
    expect(screen.queryByText("Example Label")).not.toBeNull();
  });
});
