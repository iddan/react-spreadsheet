// @flow

import * as React from "react";
import type { Node } from "react";
import { range } from "./util";

export type Props = {
  columns: number,
  hideColumnIndicators: ?boolean,
  children: Node,
};

const Table = ({
  children,
  columns,
  hideColumnIndicators,
}: Props): React.Node => {
  const columnCount = columns + (hideColumnIndicators ? 0 : 1);
  const columnNodes = range(columnCount).map((i) => <col key={i} />);
  return (
    <table className="Spreadsheet__table">
      <colgroup>{columnNodes}</colgroup>
      <tbody>{children}</tbody>
    </table>
  );
};

export default Table;
