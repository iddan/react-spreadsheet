import * as React from "react";
import { range } from "./util";

export type Props = {
  columns: number;
  hideColumnIndicators?: boolean | null;
  children: React.ReactNode;
};

const Table: React.FC<Props> = ({
  children,
  columns,
  hideColumnIndicators,
}) => {
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
