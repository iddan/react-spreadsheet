import * as React from "react";
import { Spreadsheet } from "..";
import { EMPTY_DATA } from "./shared";
import "./index.css";

const ROW_LABELS = ["Name", "Age", "Email", "Address"];

export default <Spreadsheet data={EMPTY_DATA} rowLabels={ROW_LABELS} />;
