/**
 * Example custom cell component
 */

import * as React from "react";
import classnames from "classnames";
import { CellComponent } from "..";

const HEIGHT = 30;
const WIDTH = 96;

const CustomCell: CellComponent = ({
  column,
  row,
  setCellDimensions,
  select,
  activate,
  mode,
  dragging,
  active,
  data,
  evaluatedData,
  DataViewer,
  setCellData,
}) => {
  const rootRef = React.createRef<HTMLTableCellElement>();

  React.useEffect(() => {
    setCellDimensions(
      { row, column },
      {
        height: HEIGHT,
        width: WIDTH,
        left: WIDTH * (column + 1),
        top: HEIGHT * (row + 1),
      }
    );
  }, [setCellDimensions, column, row]);

  React.useEffect(() => {
    if (rootRef.current && active && mode === "view") {
      rootRef.current.focus();
    }
  }, [rootRef, active, mode]);

  const handleMouseDown = React.useCallback(
    (event) => {
      if (mode === "view") {
        if (event.shiftKey) {
          select({ row, column });
          return;
        }

        activate({ row, column });
      }
    },
    [select, activate, column, mode, row]
  );

  const handleMouseOver = React.useCallback(() => {
    if (dragging) {
      select({ row, column });
    }
  }, [dragging, select, column, row]);

  if (data && data.DataViewer) {
    ({ DataViewer, ...data } = data);
  }

  return (
    <td
      ref={rootRef}
      className={classnames(
        "Spreadsheet__cell",
        data && data.readOnly && "Spreadsheet__cell--readonly",
        data && data.className
      )}
      style={{
        borderColor: active ? "black" : "none",
      }}
      tabIndex={0}
      onMouseOver={handleMouseOver}
      onMouseDown={handleMouseDown}
    >
      <DataViewer
        row={row}
        column={column}
        cell={data}
        evaluatedCell={evaluatedData}
        setCellData={setCellData}
      />
    </td>
  );
};

export default CustomCell;
