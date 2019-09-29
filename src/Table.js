// @flow

import React from "react";
import type { Node } from "react";
import { range } from "./util";

export type Props = {
  columns: number,
  children: Node
};

const Table = ({ children, columns }: Props) => {
  const columnNodes = range(columns).map(() => <col />);
  return (
    <table className="SpreadsheetTable">
      <colgroup>{columnNodes}</colgroup>
      <tbody>{children}</tbody>
    </table>
  );
};

export default Table;
