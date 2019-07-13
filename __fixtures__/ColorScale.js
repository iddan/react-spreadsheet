// @flow

import { createFixture } from "react-cosmos";
import Spreadsheet, {
  createEmptyMatrix
} from "../src/SpreadsheetStateProvider";
import createColorScaleDataViewer from "../src/ColorScaleDataViewer";
import "./index.css";

const ROWS = 5;

const initialData = createEmptyMatrix(ROWS, 4);

const GreenAndWhiteColorScaleDataViewer = createColorScaleDataViewer({
  minPoint: { type: "minimum", color: "#57BB8A" },
  maxPoint: { type: "maximum", color: "#FFFFFF" }
});

for (let i = 0; i < ROWS; i++) {
  console.log(i, initialData[i]);
  initialData[i][0] = {
    DataViewer: GreenAndWhiteColorScaleDataViewer,
    value: i + 1
  };
}

const RedYellowGreenColorScaleDataViewer = createColorScaleDataViewer({
  minPoint: { type: "minimum", color: "#57BB8A" },
  midPoint: { type: "percent", color: "#FFD665", value: 0.5 },
  maxPoint: { type: "maximum", color: "#E67B73" }
});

for (let i = 0; i < ROWS; i++) {
  initialData[i][1] = {
    DataViewer: RedYellowGreenColorScaleDataViewer,
    value: i + 1
  };
}

export default createFixture({
  component: Spreadsheet,
  props: {
    data: initialData
  }
});
