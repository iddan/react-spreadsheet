// @flow

import * as React from "react";
import { columnIndexToLabel } from "hot-formula-parser";

export type Props = {
  column: number,
  label?: React.Node | null,
};

const ColumnIndicator = ({ column, label }: Props): React.Node => (
  <th className="Spreadsheet__header">
    {label !== undefined ? label : columnIndexToLabel(column)}
  </th>
);

export default ColumnIndicator;
