import * as React from "react";
import { columnIndexToLabel } from "hot-formula-parser";

export type Props = {
  column: number;
  label?: React.ReactNode | null;
};

const ColumnIndicator = ({ column, label }: Props): React.ReactElement => (
  <th className="Spreadsheet__header">
    {label !== undefined ? label : columnIndexToLabel(String(column))}
  </th>
);

export default ColumnIndicator;
