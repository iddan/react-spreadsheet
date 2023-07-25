/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import * as Types from "./types";
import RowIndicator from "./RowIndicator";

const EXAMPLE_PROPS: Types.RowIndicatorProps = {
  row: 0,
  selected: false,
  onSelect: jest.fn(),
};

const wrapper = ({ children }: { children?: React.ReactNode }) => {
  return (
    <table>
      <thead>
        <tr>{children}</tr>
      </thead>
    </table>
  );
};

describe("<RowIndicator />", () => {
  test("renders with row number", () => {
    render(<RowIndicator {...EXAMPLE_PROPS} />, { wrapper });
    expect(document.querySelectorAll("th.Spreadsheet__header").length).toBe(1);
    expect(screen.queryByText("1")).not.toBeNull();
  });
  test("renders with label", () => {
    render(<RowIndicator {...EXAMPLE_PROPS} label="Example Label" />, {
      wrapper,
    });
    expect(document.querySelectorAll("th.Spreadsheet__header").length).toBe(1);
    expect(screen.queryByText("Example Label")).not.toBeNull();
  });
  test("calls on select", () => {
    render(<RowIndicator {...EXAMPLE_PROPS} />, { wrapper });
    expect(document.querySelectorAll("th.Spreadsheet__header").length).toBe(1);
    const indicator = document.querySelector(
      "th.Spreadsheet__header"
    ) as HTMLTableCellElement;
    indicator.click();
    expect(EXAMPLE_PROPS.onSelect).toBeCalledTimes(1);
  });
});
