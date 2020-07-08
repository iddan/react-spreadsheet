import React, { useState } from "react";
import { createFixture } from "react-cosmos";
import { cloneDeep } from "lodash";
import Spreadsheet, {
  createEmptyMatrix
} from "../src/SpreadsheetStateProvider";
import "./index.css";

export const INITIAL_ROWS = 6;
export const INITIAL_COLUMNS = 4;
const data = createEmptyMatrix(INITIAL_ROWS, INITIAL_COLUMNS);
const ManualSelectSpreadsheet = () => {
  const [selected, setSelected] = useState([
    { column: 0, row: 1 },
    { column: 2, row: 2 }
  ]);
  const onChange = (index, key, value) => {
    const newSelected = cloneDeep(selected);
    newSelected[index][key] = parseInt(value);
    setSelected(newSelected);
  };

  return (
    <div>
      <div>
        <div>
          <h3>Starting point</h3>
          <label for="male">Column: </label>
          <input
            type="text"
            value={selected[0].column}
            onChange={e => onChange(0, "column", e.target.value)}
          />
          <label for="male">Row: </label>
          <input
            type="text"
            value={selected[0].row}
            onChange={e => onChange(0, "row", e.target.value)}
          />
        </div>
        <div>
          <h3>Ending point</h3>
          <label for="male">Column: </label>
          <input
            type="text"
            value={selected[1].column}
            onChange={e => onChange(1, "column", e.target.value)}
          />
          <label for="male">Row: </label>
          <input
            type="text"
            value={selected[1].row}
            onChange={e => onChange(1, "row", e.target.value)}
          />
        </div>
      </div>
      <Spreadsheet data={data} selected={selected} />
    </div>
  );
};

ManualSelectSpreadsheet.displayName = "Spreadsheet";

export default createFixture({
  component: ManualSelectSpreadsheet,
  name: "Manual Select"
});
