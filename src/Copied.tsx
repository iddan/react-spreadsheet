import React from "react";
import unistoreReact from "unistore/react";
import * as PointSet from "./point-set";
import * as PointMap from "./point-map";
import FloatingRect, { mapStateToProps } from "./FloatingRect";

const Copied = (props) => <FloatingRect {...props} variant="copied" />;

export default unistoreReact.connect((state) =>
  mapStateToProps(
    state.hasPasted ? PointSet.from([]) : PointMap.map(() => true, state.copied)
  )(state)
)(Copied);
