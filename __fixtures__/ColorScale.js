import { createFixture } from "react-cosmos";
import Spreadsheet, {
  createEmptyMatrix
} from "../src/SpreadsheetStateProvider";
import createColorScaleDataViewer from "../src/ColorScaleDataViewer";
import "./index.css";

const initialData = createEmptyMatrix(4, 4);

for (let i = 0; i < 4; i++) {
  initialData[i][0] = {
    DataViewer: createColorScaleDataViewer({
      minPoint: { type: "maximum", color: "#57BB8A" },
      maxPoint: { type: "minimum", color: "#FFFFFF" }
    }),
    value: i + 1
  };
}

export default createFixture({
  component: Spreadsheet,
  props: {
    data: initialData
  }
});
