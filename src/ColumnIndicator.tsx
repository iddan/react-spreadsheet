import * as React from "react";
import { columnIndexToLabel } from "hot-formula-parser";

export type Props = {
  column: number;
  label?: React.ReactNode | null;
};

const ColumnIndicator: React.FC<Props> = ({ column, label }) => (
  <th className="Spreadsheet__header">
    {label !== undefined ? label : columnIndexToLabel(String(column))}
  </th>
);

export default ColumnIndicator;
