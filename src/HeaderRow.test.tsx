/**
 * @jest-environment jsdom
 */

import React from "react";
import { render } from "@testing-library/react";
import HeaderRow from "./HeaderRow";

const wrapper = ({ children }: { children?: React.ReactNode }) => {
  return (
    <table>
      <tbody>{children}</tbody>
    </table>
  );
};

describe("<HeaderRow />", () => {
  test("renders", () => {
    render(<HeaderRow />, {
      wrapper,
    });
    const row = document.querySelector("tr");
    expect(row).not.toBeNull();
  });
  test("renders with children", () => {
    render(
      <HeaderRow>
        <th></th>
      </HeaderRow>,
      {
        wrapper,
      }
    );
    const cell = document.querySelector("tr th");
    expect(cell).not.toBeNull();
  });
});
