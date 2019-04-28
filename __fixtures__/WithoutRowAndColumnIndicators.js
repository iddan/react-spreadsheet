import Spreadsheet from "../src/SpreadsheetStateProvider";
import { range } from "../src/util";
import "./index.css";
import { createFixture } from "react-cosmos";

export const INITIAL_ROWS = 6;
export const INITIAL_COLUMNS = 4;

const initialData = range(INITIAL_ROWS).map(() => Array(INITIAL_COLUMNS));

Spreadsheet.displayName = "Spreadsheet";

export default createFixture({
  component: Spreadsheet,
  props: {
    data: initialData,
    hideColumnIndicators: true,
    hideRowIndicators: true
  }
});
