import React from "react";
import { Spreadsheet, createEmptyMatrix } from "..";
import { INITIAL_ROWS, INITIAL_COLUMNS } from "./shared";
import "./index.css";

const data = createEmptyMatrix(INITIAL_ROWS, INITIAL_COLUMNS);
data[0][0] = { readOnly: true, value: "Read Only" };

export default <Spreadsheet data={data} />;
