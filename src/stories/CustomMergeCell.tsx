import React, {
  createRef,
  useCallback,
  useEffect,
  useState,
  MouseEvent,
} from "react";
import classnames from "classnames";
import { CellComponent } from "..";

export const CustomMergeCell: CellComponent = ({
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
  const rootRef = createRef<HTMLTableCellElement>();
  const [dimension, setDimension] = useState({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
  });

  const getColumnRangeSplit = (str: string) => {
    if (!str) return {};
    const regex = /([A-Za-z]+)(\d+):([A-Za-z]+)(\d+)/;
    const matches = str.match(regex);
    if (matches) {
      const [, startColumn, startRow, endColumn, endRow] = matches;
      return { startColumn, startRow, endColumn, endRow };
    } else {
      console.log("No match found.");
      return {};
    }
  };
  const getColumnRange = (columnRange: string) => {
    if (!columnRange) {
      return { colspan: undefined, rowspan: undefined };
    }
    const { startColumn, startRow, endColumn, endRow } =
      getColumnRangeSplit(columnRange);
    const colspan =
      (endColumn?.charCodeAt(0) ?? 0) - (startColumn?.charCodeAt(0) ?? 0);
    const rowspan = parseInt(endRow ?? "") - parseInt(startRow ?? "");

    return {
      colspan: colspan === 0 ? undefined : colspan + 1,
      rowspan: rowspan === 0 ? undefined : rowspan + 1,
    };
  };

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      console.log("resize", {
        width: entries[0].target.getBoundingClientRect().width,
        height: entries[0].target.getBoundingClientRect().height,
        top: entries[0].target.getBoundingClientRect().top - 16,
        left: entries[0].target.getBoundingClientRect().left - 16,
      });
      setDimension({
        width: entries[0].target.getBoundingClientRect().width,
        height: entries[0].target.getBoundingClientRect().height,
        top: entries[0].target.getBoundingClientRect().top - 16,
        left: entries[0].target.getBoundingClientRect().left - 16,
      });
    });
    if (rootRef.current) {
      observer.observe(rootRef.current);
    }
    return () => {
      rootRef.current && observer.unobserve(rootRef.current);
    };
  }, []);

  useEffect(() => {
    if (rootRef.current) {
      setDimension({
        width: rootRef.current.getBoundingClientRect().width,
        height: rootRef.current.getBoundingClientRect().height,
        top: rootRef.current.getBoundingClientRect().top - 16,
        left: rootRef.current.getBoundingClientRect().left - 16,
      });
    }
  }, []);

  useEffect(() => {
    setCellDimensions({ row, column }, dimension);
  }, [setCellDimensions, dimension, column, row]);

  useEffect(() => {
    if (rootRef.current && active && mode === "view") {
      rootRef.current.focus();
    }
  }, [rootRef, active, mode]);

  const handleMouseDown = useCallback(
    (event: MouseEvent) => {
      if (mode === "view") {
        if (event.shiftKey) {
          select({ row, column });
          return;
        }

        activate({ row, column });
      }
    },
    [select, activate, column, mode, row, dimension]
  );

  const handleMouseOver = useCallback(() => {
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
        display: data?.isMerged && !data?.mergeRange ? "none" : undefined,
      }}
      tabIndex={0}
      onMouseOver={handleMouseOver}
      onMouseDown={handleMouseDown}
      colSpan={getColumnRange(data?.mergeRange ?? "").colspan}
      rowSpan={getColumnRange(data?.mergeRange ?? "").rowspan}
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

export default CustomMergeCell;
