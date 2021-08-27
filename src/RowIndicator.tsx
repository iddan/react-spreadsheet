import * as React from "react";

export type Props = {
  row: number;
  label?: React.ReactNode | null;
};

export const RowIndicator: React.FC<Props> = ({ row, label }) => (
  <th className="Spreadsheet__header">
    {label !== undefined ? label : row + 1}
  </th>
);

export default RowIndicator;
