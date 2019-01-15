import React from "react";
import { storiesOf } from "@storybook/react";
import Spreadsheet from "../src/SpreadsheetStateProvider";
import Basic from "./Basic";
import Controlled from "./Controlled";
import CustomCell from "./CustomCell";
import SelectCell from "./SelectCell";
import Filter from "./Filter";
import WithColumnLabls from "./withColumnLabels";
import WithoutRowAndColumnIndicators from "./WithoutRowAndColumnIndicators";

storiesOf("Spreadsheet", Spreadsheet)
  .add("Basic", () => <Basic />)
  .add("Controlled", () => <Controlled />)
  .add("CustomCell", () => <CustomCell />)
  .add("Filter", () => <Filter />)
  .add("Select Cell", () => <SelectCell />)
  .add("With Column Labels", () => <WithColumnLabls />)
  .add("Without column and row indicators", () => (
    <WithoutRowAndColumnIndicators />
  ));
