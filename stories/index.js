import React from "react";
import { storiesOf } from "@storybook/react";
import Spreadsheet from "../src/SpreadsheetStateProvider";
import Basic from "./Basic";
import Controlled from "./Controlled";
import CustomCell from "./CustomCell";
import SelectCell from "./SelectCell";
import Filter from "./Filter";
import WithColumnLabels from "./withColumnLabels";
import WithRowLabels from "./WithRowLabels";
import WithoutRowAndColumnIndicators from "./WithoutRowAndColumnIndicators";
import CellCommit from "./CellCommit";
import AsyncCell from "./AsyncCell";
storiesOf("Spreadsheet", Spreadsheet)
  .add("Basic", () => <Basic />)
  .add("Controlled", () => <Controlled />)
  .add("CustomCell", () => <CustomCell />)
  .add("Filter", () => <Filter />)
  .add("Select Cell", () => <SelectCell />)
  .add("With Column Labels", () => <WithColumnLabels />)
  .add("With Row Labels", () => <WithRowLabels />)
  .add("Without column and row indicators", () => (
    <WithoutRowAndColumnIndicators />
  ))
  .add("With onCellCommit event", () => <CellCommit />)
  .add("Async cell", () => <AsyncCell />);
