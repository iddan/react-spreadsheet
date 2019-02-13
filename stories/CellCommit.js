import React from "react";

import Spreadsheet from "../src/SpreadsheetStateProvider";
import { range } from "../src/util";
import "./index.css";
import { action } from "@storybook/addon-actions";

export const INITIAL_ROWS = 6;
export const INITIAL_COLUMNS = 4;

const initialData = range(INITIAL_ROWS).map(() => Array(INITIAL_COLUMNS));

const CellCommit = props => (
  <Spreadsheet data={initialData} onCellCommit={action("onCellCommit event")} />
);

export default CellCommit;
