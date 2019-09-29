// @flow

import React from "react";
import type { Node } from "react";
import { range } from "./util";

export type Props = {
  columns: number,
  hideColumnIndicators: ?boolean,
  children: Node
};

const Table = ({ children, columns, hideColumnIndicators }: Props) => {
  const columnIndicatorsShown = !hideColumnIndicators;
  const columnNodes = range(columns + Number(columnIndicatorsShown)).map(i => (
    <col key={i} />
  ));
  return (
    <table className="SpreadsheetTable">
      <colgroup>{columnNodes}</colgroup>
      <tbody>{children}</tbody>
    </table>
  );
};

export default Table;
