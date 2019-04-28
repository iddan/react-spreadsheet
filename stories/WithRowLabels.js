import React from "react";

import Spreadsheet from "../src/SpreadsheetStateProvider";
import { range } from "../src/util";
import "./index.css";

export const INITIAL_COLUMNS = 6;

const rowLabels = ["Name", "Age", "Email", "Address"];
const initialData = range(rowLabels.length).map(() => Array(INITIAL_COLUMNS));

const withRowLabels = () => (
  <Spreadsheet data={initialData} rowLabels={rowLabels} />
);

export default withRowLabels;
