import React from "react";
import { createFixture } from "react-cosmos";

import Spreadsheet from "../src/SpreadsheetStateProvider";
import { range } from "../src/util";
import "./index.css";

export const INITIAL_COLUMNS = 6;

const rowLabels = ["Name", "Age", "Email", "Address"];
const initialData = range(rowLabels.length).map(() => Array(INITIAL_COLUMNS));

Spreadsheet.displayName = "Spreadsheet";

export default createFixture({
  component: Spreadsheet,
  props: {
    data: initialData,
    rowLabels
  }
});
