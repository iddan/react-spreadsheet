import { createFixture } from "react-cosmos";
import React from 'react';

import Spreadsheet, {
  createEmptyMatrix
} from "../src/SpreadsheetStateProvider";
import { INITIAL_ROWS, INITIAL_COLUMNS } from "./Basic";
import "./index.css";

const initialData = createEmptyMatrix(INITIAL_ROWS, INITIAL_COLUMNS);

Spreadsheet.displayName = "Spreadsheet";

function CornerIndicator() {
  return (
    <th
      style={{ position: 'relative' }}
      onClick={() => alert('You clicked the corner indicator!')}
    >
      <div style={{
        bottom: -3,
        position: 'absolute',
        right: 1,

        width: 0,
        height: 0,
        borderTop: '8px solid transparent',
        borderBottom: '8px solid transparent',
        borderLeft: '8px solid #777',
        transform: 'rotate(45deg)',
      }} />
    </th>
  );
}

export default createFixture({
  component: Spreadsheet,
  name: "WithCornerIndicator",
  props: {
    data: initialData,
    CornerIndicator
  }
});
