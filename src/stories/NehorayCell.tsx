/**
 * Example custom cell component
 */

import * as React from "react";
import classnames from "classnames";
import { CellComponent } from "..";
import { DataViewerComponent, DataEditorComponent, CellBase } from "..";
type Cell = CellBase<number | undefined>;

const HEIGHT = 30;
const WIDTH = 96;
export const RangeView: DataViewerComponent<Cell> = ({ cell }) => (
  <input
    type="range"
    value={cell?.value}
    disabled
    style={{ pointerEvents: "none" }}
  />
);

export const RangeEdit: DataEditorComponent<Cell> = ({ cell, onChange }) => {
  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ ...cell, value: Number(event.target.value) });
    },
    [cell, onChange]
  );

  const value = cell?.value || 0;
  return <input autoFocus type="range" onChange={handleChange} value={value} />;
};

const NehorayCell: CellComponent = ({
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
  const checkData = (() => {
    if (data) {
      if (typeof +data?.value === 'number' && rootRef.current) {
        if (+data.value > 0) {
          rootRef.current.style.background = '#a5d4d0'
        } else if (+data.value < 0) {
          rootRef.current.style.background = '#dcbdc7'
        }
      }
    }
  })
  React.useEffect(() => {
    checkData()
  }, [data])
  return (
    <td
      ref={rootRef}
      className={classnames(
        "Spreadsheet__cell",
        data && data.readOnly && "Spreadsheet__cell--readonly",
        data && data.className
      )}
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

export default NehorayCell;
