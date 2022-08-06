/**
 * @jest-environment jsdom
 */

import React from "react";
import { render } from "@testing-library/react";
import DataViewer, {
  convertBooleanToText,
  FALSE_TEXT,
  TRUE_TEXT,
} from "./DataViewer";
import * as Types from "./types";

const MOCK_SET_CELL_DATA = jest.fn();
const EXAMPLE_VALUE = "EXAMPLE_VALUE";
const EXAMPLE_PROPS: Types.DataViewerProps = {
  row: 0,
  column: 0,
  cell: { value: EXAMPLE_VALUE },
  evaluatedCell: undefined,
  setCellData: MOCK_SET_CELL_DATA,
};

describe("<DataViewer />", () => {
  const cases = [
    [
      "renders value",
      EXAMPLE_VALUE,
      ".Spreadsheet__data-viewer",
      EXAMPLE_VALUE,
    ],
    [
      "renders boolean",
      true,
      ".Spreadsheet__data-viewer.Spreadsheet__data-viewer--boolean",
      convertBooleanToText(true),
    ],
  ] as const;
  test.each(cases)(
    "%s",
    (name, value, expectedSelector, expectedTextContent) => {
      render(<DataViewer {...EXAMPLE_PROPS} cell={{ value }} />);
      const element = document.querySelector(expectedSelector);
      expect(element).not.toBeNull();
      expect(element?.textContent).toBe(expectedTextContent);
    }
  );
});

describe("convertBooleanToText()", () => {
  const cases = [
    [true, TRUE_TEXT],
    [false, FALSE_TEXT],
  ] as const;
  test.each(cases)("%s", (value, expected) => {
    expect(convertBooleanToText(value)).toBe(expected);
  });
});
