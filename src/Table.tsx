import * as React from "react";
import { range } from "./util";

export type Props = {
  columns: number;
  hideColumnIndicators?: boolean;
  children: React.ReactChildren;
};

const Table = ({ children, columns, hideColumnIndicators }: Props) => {
  const columnIndicatorsShown = !hideColumnIndicators;
  const columnNodes = range(columns + Number(columnIndicatorsShown)).map(i => (
    <col key={i} />
  ));
  return (
    <table className='SpreadsheetTable'>
      <colgroup>{columnNodes}</colgroup>
      <tbody>{children}</tbody>
    </table>
  );
};

export default Table;
