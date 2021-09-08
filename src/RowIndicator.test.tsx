/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import RowIndicator from "./RowIndicator";

describe("<RowIndicator />", () => {
  test("renders with row number", () => {
    render(<RowIndicator row={0} />);
    expect(document.querySelectorAll("th.Spreadsheet__header").length).toBe(1);
    expect(screen.queryByText("1")).not.toBeNull();
  });
  test("renders with label", () => {
    render(<RowIndicator row={0} label="Example Label" />);
    expect(document.querySelectorAll("th.Spreadsheet__header").length).toBe(1);
    expect(screen.queryByText("Example Label")).not.toBeNull();
  });
});
