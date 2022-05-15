import * as React from "react";
import * as Types from "./types";

const Row: Types.RowComponent = (props) => (
  <div role="row" className="Spreadsheet__body-row" {...props} />
);

export default Row;
