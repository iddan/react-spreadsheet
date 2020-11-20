import React from "react";
import { Spreadsheet } from "..";
import { EMPTY_DATA } from "./shared";
import "./index.css";

export default (
  <Spreadsheet
    data={EMPTY_DATA}
    onKeyDown={(event) => {
      if (event.altKey) {
        event.preventDefault();
      }
    }}
  />
);
