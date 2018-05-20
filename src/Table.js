// @flow

import React from "react";
import type { Node } from "react";

export type Props = {
  children: Node
};

const Table = ({ children }: Props) => (
  <table className="SpreadsheetTable">
    <tbody>{children}</tbody>
  </table>
);

export default Table;
