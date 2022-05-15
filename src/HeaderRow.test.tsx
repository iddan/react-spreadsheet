/**
 * @jest-environment jsdom
 */

import React from "react";
import { render } from "@testing-library/react";
import HeaderRow from "./HeaderRow";

describe("<HeaderRow />", () => {
  test("renders", () => {
    render(<HeaderRow />);
    const row = document.querySelector("[role=row]");
    expect(row).not.toBeNull();
  });
  test("renders with children", () => {
    render(
      <HeaderRow>
        <div role="columnheader"></div>
      </HeaderRow>
    );
    const cell = document.querySelector("[role=columnheader]");
    expect(cell).not.toBeNull();
  });
});
