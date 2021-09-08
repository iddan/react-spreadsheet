/**
 * @jest-environment jsdom
 */

import React from "react";
import { render } from "@testing-library/react";
import FloatingRect from "./FloatingRect";

describe("<FloatingRect />", () => {
  test("renders", () => {
    render(<FloatingRect variant="selected" />);
    const element = document.querySelector(
      ".Spreadsheet__floating-rect.Spreadsheet__floating-rect--selected"
    );
    expect(element).not.toBeNull();
    if (!element) {
      throw new Error("element must be defined");
    }
    const style = window.getComputedStyle(element);
    expect(style.left).toBe("");
    expect(style.top).toBe("");
    expect(style.width).toBe("");
    expect(style.height).toBe("");
  });
  test("renders dimensions", () => {
    render(
      <FloatingRect
        dimensions={{ left: 100, top: 100, width: 100, height: 100 }}
        variant="selected"
      />
    );
    const element = document.querySelector(
      ".Spreadsheet__floating-rect.Spreadsheet__floating-rect--selected"
    );
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
    render(<FloatingRect hidden variant="selected" />);
    expect(
      document.querySelectorAll(
        ".Spreadsheet__floating-rect.Spreadsheet__floating-rect--hidden"
      ).length
    ).toBe(1);
  });
  test("renders dragging", () => {
    render(<FloatingRect dragging variant="selected" />);
    expect(
      document.querySelectorAll(
        ".Spreadsheet__floating-rect.Spreadsheet__floating-rect--dragging"
      ).length
    ).toBe(1);
  });
});
