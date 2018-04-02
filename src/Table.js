// @flow

import React from "react";
import type { Node } from "react";

export type Props = {
  onKeyPress: KeyboardEvent => void,
  onKeyDown: KeyboardEvent => void,
  children: Node
};

const Table = ({ onKeyPress, onKeyDown, children }: Props) => (
  <table
    className="SpreadsheetTable"
    onKeyPress={onKeyPress}
    onKeyDown={onKeyDown}
  >
    <tbody>{children}</tbody>
  </table>
);

export default Table;
