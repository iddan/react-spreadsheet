/**
 * This fixture demonstrates providing a custom cell component
 */

import React, { useCallback, useEffect } from "react";
import { createFixture } from "react-cosmos";
import classnames from "classnames";
import Spreadsheet, { createEmptyMatrix } from "../src";
import { INITIAL_ROWS, INITIAL_COLUMNS } from "./Basic";
import "./index.css";

const initialData = createEmptyMatrix(INITIAL_ROWS, INITIAL_COLUMNS);

Spreadsheet.displayName = "Spreadsheet";

const HEIGHT = 30;
const WIDTH = 96;

const Cell = ({
  column,
  row,
  setCellDimensions,
  select,
  activate,
  mode,
  dragging,
  active,
  getValue,
  formulaParser,
  data,
  DataViewer,
}) => {
  const root = React.createRef();

  useEffect(() => {
    setCellDimensions(
      { row, column },
      {
        height: HEIGHT,
        width: WIDTH,
        left: WIDTH * (column + 1),
        top: HEIGHT * (row + 1),
      }
    );
  }, [setCellDimensions]);

  useEffect(() => {
    if (root.current && active && mode === "view") {
      root.current.focus();
    }
  });

  const handleMouseDown = useCallback(
    (event) => {
      if (mode === "view") {
        if (event.shiftKey) {
          select({ row, column });
          return;
        }

        activate({ row, column });
      }
    },
    [select, activate]
  );

  const handleMouseOver = useCallback(
    (event) => {
      if (dragging) {
        select({ row, column });
      }
    },
    [dragging, select]
  );

  if (data && data.DataViewer) {
    ({ DataViewer, ...data } = data);
  }

  return (
    <td
      ref={root}
      className={classnames(
        "Spreadsheet__cell",
        data && data.readOnly && "Spreadsheet__cell--readonly",
        data && data.className
      )}
      style={{
        borderColor: !active && "black",
      }}
      tabIndex={0}
      onMouseOver={handleMouseOver}
      onMouseDown={handleMouseDown}
    >
      <DataViewer
        row={row}
        column={column}
        cell={data}
        getValue={getValue}
        formulaParser={formulaParser}
      />
    </td>
  );
};

export default createFixture({
  component: Spreadsheet,
  name: "CustomCell",
  props: {
    data: initialData,
    Cell,
  },
});
