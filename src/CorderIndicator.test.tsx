/**
 * @jest-environment jsdom
 */

import React from "react";
import { render } from "@testing-library/react";
import CornerIndicator from "./CornerIndicator";

describe("<CornerIndicator />", () => {
  test("renders", () => {
    render(<CornerIndicator />);
    expect(document.querySelectorAll("th.Spreadsheet__header").length).toBe(1);
  });
});
