/**
 * @jest-environment jsdom
 */

import React from "react";
import { render } from "@testing-library/react";
import Row from "./Row";

describe("<Row />", () => {
  test("renders", () => {
    render(<Row row={0} />);
    const row = document.querySelector("[role=row]");
    expect(row).not.toBeNull();
  });
  test("renders with children", () => {
    render(
      <Row row={1}>
        <div role="cell"></div>
      </Row>
    );
    const cell = document.querySelector("[role=cell]");
    expect(cell).not.toBeNull();
  });
});
