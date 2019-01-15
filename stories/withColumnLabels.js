import React from "react";

import Spreadsheet from "../src/SpreadsheetStateProvider";
import { range } from "../src/util";
import "./index.css";

export const INITIAL_ROWS = 6;
export const INITIAL_COLUMNS = 4;

const columnLabels = ["Name", "Age", "Email", "Address", "Rabin"];
const initialData = range(INITIAL_ROWS).map(() => Array(columnLabels.length));

const WithColumnLabls = () => (
  <Spreadsheet data={initialData} columnLabels={columnLabels} />
);

export default WithColumnLabls;
