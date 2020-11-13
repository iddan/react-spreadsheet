// @flow

import * as React from "react";

export type Props = {
  row: number,
  label?: React.Node | null,
};

export const RowIndicator = ({ row, label }: Props): React.Node => (
  <th className="Spreadsheet__header">
    {label !== undefined ? label : row + 1}
  </th>
);

export default RowIndicator;
