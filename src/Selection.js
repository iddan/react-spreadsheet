// @flow
import React from "react";
import classnames from "classnames";
import { connect } from "unistore/react";
import * as PointMap from "./point-map";
import * as PointSet from "./point-set";
import "./Selection.css";

const Selection = ({ width, height, top, left, hidden }) => (
  <div
    className={classnames("Selection", { hidden })}
    style={{ width, height, top, left }}
  />
);

const mapStateToProps = state => {
  const { tableDimensions } = state;
  const { width, height, top, left } = PointSet.reduce(
    (acc, point) => {
      const isOnEdge = PointSet.onEdge(state.selected, point);
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
    state.selected,
    { width: 0, height: 0, left: 0, top: 0 }
  );
  console.log(tableDimensions);
  return {
    width: width,
    height: height,
    top: tableDimensions ? top - tableDimensions.top : 0,
    left: tableDimensions ? left - tableDimensions.left : 0,
    hidden: true
  };
};

export default connect(mapStateToProps)(Selection);
