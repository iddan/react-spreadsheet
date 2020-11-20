import React from "react";

import { Spreadsheet } from "..";
import { EMPTY_DATA } from "./shared";
import "./index.css";

function CornerIndicator() {
  return (
    <th
      className="Spreadsheet__header"
      style={{ position: "relative" }}
      onClick={() => alert("You clicked the corner indicator!")}
    >
      <div
        style={{
          bottom: -3,
          position: "absolute",
          right: 1,
          width: 0,
          height: 0,
          borderTop: "8px solid transparent",
          borderBottom: "8px solid transparent",
          borderLeft: "8px solid #777",
          transform: "rotate(45deg)",
        }}
      />
    </th>
  );
}

export const WithCornerIndicator = (
  <Spreadsheet data={EMPTY_DATA} CornerIndicator={CornerIndicator} />
);
