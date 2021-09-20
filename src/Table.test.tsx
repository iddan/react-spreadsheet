/**
 * @jest-environment jsdom
 */

import React from "react";
import { render } from "@testing-library/react";
import Table from "./Table";

describe("<Table />", () => {
  test("renders empty table", () => {
    render(<Table columns={0}>{null}</Table>);
    expect(
      document.querySelectorAll(".Spreadsheet__table colgroup col").length
    ).toBe(1);
    expect(document.querySelectorAll(".Spreadsheet__table tbody").length).toBe(
      1
    );
  });
  test("renders table with content", () => {
    render(<Table columns={0}>{<tr id="exampleRow" />}</Table>);
    expect(
      document.querySelectorAll(".Spreadsheet__table tbody #exampleRow").length
    ).toBe(1);
  });
  test("renders empty table with no cols if hideColumnIndicators is set", () => {
    render(
      <Table columns={0} hideColumnIndicators>
        {null}
      </Table>
    );
    expect(
      document.querySelectorAll(".Spreadsheet__table colgroup col").length
    ).toBe(0);
  });
  test("renders columns according to given prop", () => {
    const columns = 1;
    render(<Table columns={columns}>{null}</Table>);
    expect(
      document.querySelectorAll(".Spreadsheet__table colgroup col").length
    ).toBe(columns + 1);
  });
});
