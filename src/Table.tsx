import * as React from "react";
import * as Types from "./types";
import { range } from "./util";

const Table: Types.TableComponent = ({
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
