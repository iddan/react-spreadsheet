import React from "react";

import Spreadsheet from "../src/SpreadsheetStateProvider";
import { range } from "../src/util";
import "./index.css";

export const INITIAL_ROWS = 6;

const columnLabels = ["Name", "Age", "Email", "Address"];
const initialData = range(INITIAL_ROWS).map(() => Array(columnLabels.length));

const withColumnLabels = () => (
  <Spreadsheet data={initialData} columnLabels={columnLabels} />
);

export default withColumnLabels;
