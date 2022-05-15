/**
 * @jest-environment jsdom
 */

import React from "react";
import { render } from "@testing-library/react";
import * as Types from "./types";
import CornerIndicator from "./CornerIndicator";

const EXAMPLE_PROPS: Types.CornerIndicatorProps = {
  selected: false,
  onSelect: jest.fn(),
  width: 100,
};

describe("<CornerIndicator />", () => {
  test("renders", () => {
    render(<CornerIndicator {...EXAMPLE_PROPS} />);
    expect(
      document.querySelectorAll("[role=columnheader].Spreadsheet__header")
        .length
    ).toBe(1);
  });
  test("calls onSelect", () => {
    render(<CornerIndicator {...EXAMPLE_PROPS} />);
    expect(
      document.querySelectorAll("[role=columnheader].Spreadsheet__header")
        .length
    ).toBe(1);
    const indicator = document.querySelector(
      "[role=columnheader].Spreadsheet__header"
    ) as HTMLTableCellElement;
    indicator.click();
    expect(EXAMPLE_PROPS.onSelect).toBeCalledTimes(1);
  });
});
