import React from "react";
// import { connect } from "unistore/react";
import * as PointMap from "./point-map";
import * as PointSet from "./point-set";
import classnames from "classnames";
import "./FloatingRect.css";

const FloatingRect = ({ width, height, top, left, className, hidden }) =>
  console.log(width, height, top, left, className, hidden) || (
    <div
      className={classnames("FloatingRect", { hidden }, className)}
      style={{ width, height, top, left }}
    />
  );

/** @todo better arch */
export const mapStateToProps = cells => state => {
  const dimensions = PointSet.reduce(
    (acc, point) => {
      const isOnEdge = PointSet.onEdge(cells, point);
      const dimensions = PointMap.get(point, state.cellDimensions);
      if (dimensions) {
        return {
          width: isOnEdge.top ? acc.width + dimensions.width : acc.width,
          height: isOnEdge.left ? acc.height + dimensions.height : acc.height,
          left: isOnEdge.left && isOnEdge.top ? dimensions.left : acc.left,
          top: isOnEdge.left && isOnEdge.top ? dimensions.top : acc.top
        };
      }
      return acc;
    },
    cells,
    { width: 0, height: 0, left: 0, top: 0 }
  );
  return {
    ...dimensions,
    hidden: PointSet.size(cells) <= 1
  };
};

export default FloatingRect;
