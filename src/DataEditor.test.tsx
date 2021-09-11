/**
 * @jest-environment jsdom
 */

import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { waitFor } from "@testing-library/dom";
import DataEditor from "./DataEditor";
import * as Types from "./types";
import * as Util from "./util";

const MOVE_CURSOR_TO_END_MOCK = jest.spyOn(Util, "moveCursorToEnd");

const EXAMPLE_VALUE = "EXAMPLE_VALUE";
const ON_CHANGE_MOCK = jest.fn();
const EXAMPLE_PROPS: Types.DataEditorProps = {
  row: 0,
  column: 0,
  cell: { value: EXAMPLE_VALUE },
  onChange: ON_CHANGE_MOCK,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("<DataEditor />", () => {
  test("renders", () => {
    render(<DataEditor {...EXAMPLE_PROPS} />);
    const element = document.querySelector(".Spreadsheet__data-editor");
    expect(element).not.toBeNull();
    expect(ON_CHANGE_MOCK).toBeCalledTimes(0);
    expect(MOVE_CURSOR_TO_END_MOCK).toBeCalledTimes(1);
  });
  test("renders correctly with null value", () => {
    render(<DataEditor {...EXAMPLE_PROPS} cell={{ value: null }} />);
    const input = document.querySelector<HTMLInputElement>(
      ".Spreadsheet__data-editor input"
    );
    expect(input).not.toBeNull();
    expect(input?.value).toBe("");
    expect(ON_CHANGE_MOCK).toBeCalledTimes(0);
    expect(MOVE_CURSOR_TO_END_MOCK).toBeCalledTimes(1);
  });
  test("renders correctly without cell", () => {
    render(<DataEditor {...EXAMPLE_PROPS} cell={undefined} />);
    const element = document.querySelector(".Spreadsheet__data-editor");
    expect(element).not.toBeNull();
    expect(ON_CHANGE_MOCK).toBeCalledTimes(0);
    expect(MOVE_CURSOR_TO_END_MOCK).toBeCalledTimes(1);
  });
  test("handles change events correctly", () => {
    render(<DataEditor {...EXAMPLE_PROPS} />);
    const input = document.querySelector<HTMLInputElement>(
      ".Spreadsheet__data-editor input"
    );
    expect(input).not.toBeNull();
    if (!input) {
      throw new Error("Input must be defined");
    }
    expect(ON_CHANGE_MOCK).toBeCalledTimes(0);
    expect(MOVE_CURSOR_TO_END_MOCK).toBeCalledTimes(1);
    fireEvent.change(input);
    waitFor(() => {
      expect(ON_CHANGE_MOCK).toBeCalledTimes(1);
    });
  });
});
