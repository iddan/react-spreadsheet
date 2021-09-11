/**
 * @jest-environment jsdom
 */

import React from "react";
import { render } from "@testing-library/react";
import DataEditor from "./DataEditor";
import * as Types from "./types";

const EXAMPLE_VALUE = "EXAMPLE_VALUE";
const EXAMPLE_PROPS: Types.DataEditorProps = {
  row: 0,
  column: 0,
  cell: { value: EXAMPLE_VALUE },
  onChange: jest.fn(),
};

describe("<DataEditor />", () => {
  test("renders", () => {
    render(<DataEditor {...EXAMPLE_PROPS} />);
    const element = document.querySelector(".Spreadsheet__data-editor");
    expect(element).not.toBeNull();
  });
  test("renders correctly with null value", () => {
    render(<DataEditor {...EXAMPLE_PROPS} cell={{ value: null }} />);
    const input = document.querySelector<HTMLInputElement>(
      ".Spreadsheet__data-editor input"
    );
    expect(input).not.toBeNull();
    expect(input?.value).toBe("");
  });
  test("renders correctly without cell", () => {
    render(<DataEditor {...EXAMPLE_PROPS} cell={undefined} />);
    const element = document.querySelector(".Spreadsheet__data-editor");
    expect(element).not.toBeNull();
  });
});
