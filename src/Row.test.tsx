/**
 * @jest-environment jsdom
 */

import React from "react";
import { render } from "@testing-library/react";
import Row from "./Row";

const wrapper: React.FC = ({ children }) => {
  return (
    <table>
      <tbody>{children}</tbody>
    </table>
  );
};

describe("<Row />", () => {
  test("renders", () => {
    render(<Row row={0} />, {
      wrapper,
    });
    const row = document.querySelector("tr");
    expect(row).not.toBeNull();
  });
  test("renders with children", () => {
    render(
      <Row row={1}>
        <td></td>
      </Row>,
      {
        wrapper,
      }
    );
    const cell = document.querySelector("tr td");
    expect(cell).not.toBeNull();
  });
});
