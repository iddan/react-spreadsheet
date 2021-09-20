/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import RowIndicator, { Props } from "./RowIndicator";

const EXAMPLE_PROPS: Props = {
  row: 0,
  selected: false,
  onSelect: jest.fn(),
};

describe("<RowIndicator />", () => {
  test("renders with row number", () => {
    render(<RowIndicator {...EXAMPLE_PROPS} />);
    expect(document.querySelectorAll("th.Spreadsheet__header").length).toBe(1);
    expect(screen.queryByText("1")).not.toBeNull();
  });
  test("renders with label", () => {
    render(<RowIndicator {...EXAMPLE_PROPS} label="Example Label" />);
    expect(document.querySelectorAll("th.Spreadsheet__header").length).toBe(1);
    expect(screen.queryByText("Example Label")).not.toBeNull();
  });
});
