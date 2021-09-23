import * as React from "react";
import * as Types from "./types";

const RowIndicator: Types.RowIndicatorComponent = ({ row, label }) => (
  <th className="Spreadsheet__header">
    {label !== undefined ? label : row + 1}
  </th>
);

export default RowIndicator;
