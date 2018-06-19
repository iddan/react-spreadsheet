import React from "react";
import { storiesOf } from "@storybook/react";
import Spreadsheet from "../src/SpreadsheetStateProvider";
import Basic from "./Basic";
import Controlled from "./Controlled";
import CustomCell from "./CustomCell";
import Filter from "./Filter";

storiesOf("Spreadsheet", Spreadsheet)
  .add("Basic", () => <Basic />)
  .add("Controlled", () => <Controlled />)
  .add("CustomCell", () => <CustomCell />)
  .add("Filter", () => <Filter />);
