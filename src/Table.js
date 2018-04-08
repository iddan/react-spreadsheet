// @flow

import React from "react";
import type { Node } from "react";

export type Props = {
  onKeyPress: KeyboardEvent => void,
  onKeyDown: KeyboardEvent => void,
  onClick: MouseEvent => void,
  children: Node
};

const Table = ({ onKeyPress, onKeyDown, onClick, children }: Props) => (
  <table
    className="SpreadsheetTable"
    onKeyPress={onKeyPress}
    onKeyDown={onKeyDown}
    onClick={onClick}
  >
    <tbody>{children}</tbody>
  </table>
);

export default Table;
