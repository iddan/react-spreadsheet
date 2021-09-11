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
    const element = document.querySelector("div");
    expect(element).not.toBeNull();
  });
});
