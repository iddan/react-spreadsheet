/**
 * @jest-environment jsdom
 */

import React from "react";
import { render } from "@testing-library/react";
import FloatingRect from "./FloatingRect";

describe("<FloatingRect />", () => {
  test("renders", () => {
    render(
      <FloatingRect
        dimensions={{ left: 100, top: 100, width: 100, height: 100 }}
        hidden={false}
        dragging={false}
        variant="selected"
      />
    );
    const element = document.querySelector(
      ".Spreadsheet__floating-rect.Spreadsheet__floating-rect--selected"
    );
    expect(element).not.toBeNull();
    if (!element) {
      throw new Error("element must be defined");
    }
    const style = window.getComputedStyle(element);
    expect(style.left).toBe("100px");
    expect(style.top).toBe("100px");
    expect(style.width).toBe("100px");
    expect(style.height).toBe("100px");
  });
  test("renders hidden", () => {
    render(
      <FloatingRect
        dimensions={{ left: 0, top: 0, width: 0, height: 0 }}
        hidden
        dragging={false}
        variant="selected"
      />
    );
    expect(
      document.querySelectorAll(
        ".Spreadsheet__floating-rect.Spreadsheet__floating-rect--hidden"
      ).length
    ).toBe(1);
  });
  test("renders dragging", () => {
    render(
      <FloatingRect
        dimensions={{ left: 0, top: 0, width: 0, height: 0 }}
        hidden={false}
        dragging
        variant="selected"
      />
    );
    expect(
      document.querySelectorAll(
        ".Spreadsheet__floating-rect.Spreadsheet__floating-rect--dragging"
      ).length
    ).toBe(1);
  });
});
