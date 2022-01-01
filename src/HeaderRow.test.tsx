/**
 * @jest-environment jsdom
 */

import React from "react";
import { render } from "@testing-library/react";
import HeaderRow from "./HeaderRow";

describe("<HeaderRow />", () => {
  test("renders", () => {
    render(<HeaderRow />);
    const row = document.querySelector("tr");
    expect(row).not.toBeNull();
  });
  test("renders with children", () => {
    render(
      <HeaderRow>
        <th></th>
      </HeaderRow>
    );
    const cell = document.querySelector("tr th");
    expect(cell).not.toBeNull();
  });
});
