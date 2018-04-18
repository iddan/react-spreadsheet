import React from "react";
import { connect } from "unistore/react";
import * as PointSet from "./point-set";
import FloatingRect, { mapStateToProps } from "./FloatingRect";

const Copied = props => <FloatingRect {...props} className="copied" />;

export default connect(
  state =>
    console.log(state) ||
    mapStateToProps(state.hasPasted ? PointSet.from([]) : state.copied)(state)
)(Copied);
