import * as React from "react";
import * as Types from "./types";
import { range } from "./util";

const Table: Types.TableComponent = ({
  children,
  columns,
  hideColumnIndicators,
}) => {
  const columnCount = columns + (hideColumnIndicators ? 0 : 1);
  const columnNodes = range(columnCount).map((i) => (
    <div className="Spreadsheet__columnNode" key={i} />
  ));
  return (
    <div role="table" className="Spreadsheet__table">
      <div role="rowgroup" className="colgroup">
        {columnNodes}
      </div>
      <div role="rowgroup" className="Spreadsheet_body">
        {children}
      </div>
    </div>
  );
};

export default Table;
