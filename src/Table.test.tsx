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
      document.querySelectorAll(
        ".Spreadsheet__table .colgroup .Spreadsheet__columnNode"
      ).length
    ).toBe(1);
    expect(
      document.querySelectorAll(".Spreadsheet__table .Spreadsheet_body").length
    ).toBe(1);
  });
  test("renders table with content", () => {
    render(<Table columns={0}>{<div role="row" id="exampleRow" />}</Table>);
    expect(
      document.querySelectorAll(
        ".Spreadsheet__table .Spreadsheet_body #exampleRow"
      ).length
    ).toBe(1);
  });
  test("renders empty table with no cols if hideColumnIndicators is set", () => {
    render(
      <Table columns={0} hideColumnIndicators>
        {null}
      </Table>
    );
    expect(
      document.querySelectorAll(
        ".Spreadsheet__table .colgroup .Spreadsheet__columnNode"
      ).length
    ).toBe(0);
  });
  test("renders columns according to given prop", () => {
    const columns = 1;
    render(<Table columns={columns}>{null}</Table>);
    expect(
      document.querySelectorAll(
        ".Spreadsheet__table .colgroup .Spreadsheet__columnNode"
      ).length
    ).toBe(columns + 1);
  });
});
