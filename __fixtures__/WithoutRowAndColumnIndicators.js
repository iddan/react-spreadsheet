import Spreadsheet, { createEmptyMatrix } from "../src";
import { INITIAL_ROWS, INITIAL_COLUMNS } from "./Basic";
import "./index.css";
import { createFixture } from "react-cosmos";

const initialData = createEmptyMatrix(INITIAL_ROWS, INITIAL_COLUMNS);

Spreadsheet.displayName = "Spreadsheet";

export default createFixture({
  component: Spreadsheet,
  props: {
    data: initialData,
    hideColumnIndicators: true,
    hideRowIndicators: true,
  },
});
