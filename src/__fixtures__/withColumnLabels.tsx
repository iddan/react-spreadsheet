import React from "react";
import { Spreadsheet, createEmptyMatrix } from "..";
import { INITIAL_ROWS } from "./shared";
import "./index.css";

const columnLabels = ["Name", "Age", "Email", "Address"];
const initialData = createEmptyMatrix(INITIAL_ROWS, columnLabels.length);

export default <Spreadsheet data={initialData} columnLabels={columnLabels} />;
