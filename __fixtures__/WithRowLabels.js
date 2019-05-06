import { createFixture } from "react-cosmos";
import Spreadsheet, {
  createEmptyMatrix
} from "../src/SpreadsheetStateProvider";
import { INITIAL_COLUMNS } from "./Basic";
import "./index.css";

const rowLabels = ["Name", "Age", "Email", "Address"];
const initialData = createEmptyMatrix(rowLabels.length, INITIAL_COLUMNS);

Spreadsheet.displayName = "Spreadsheet";

export default createFixture({
  component: Spreadsheet,
  props: {
    data: initialData,
    rowLabels
  }
});
