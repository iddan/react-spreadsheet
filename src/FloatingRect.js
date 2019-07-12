import React from "react";
import * as PointMap from "./point-map";
import * as PointSet from "./point-set";
import classnames from "classnames";
import "./FloatingRect.css";

const FloatingRect = ({ width, height, top, left, className, hidden }) => (
  <div
    className={classnames("FloatingRect", { hidden }, className)}
    style={{ width, height, top, left }}
  />
);

const sum = (...args) => args.reduce((acc, number) => acc + number, 0);

export const mapStateToProps = cells => state => {
  const { columnWidths, rowHeights, left, top } = PointSet.reduce(
    (acc, point) => {
      const dimensions = PointMap.get(point, state.cellDimensions);
      const isOnEdge = PointSet.onEdge(cells, point);
      if (dimensions) {
        acc.columnWidths[point.column] = Math.max(
          acc.columnWidths[point.column] || 0,
          dimensions.width
        );
        acc.rowHeights[point.row] = Math.max(
          acc.rowHeights[point.row] || 0,
          dimensions.height
        );
        acc.left = isOnEdge.left && isOnEdge.top ? dimensions.left : acc.left;
        acc.top = isOnEdge.left && isOnEdge.top ? dimensions.top : acc.top;
      }
      return acc;
    },
    cells,
    { left: 0, top: 0, columnWidths: [], rowHeights: [] }
  );
  const width = sum(...columnWidths.filter(Boolean));
  const height = sum(...rowHeights.filter(Boolean));
  return {
    left,
    top,
    width,
    height,
    hidden: PointSet.size(cells) === 0
  };
};

export default FloatingRect;
