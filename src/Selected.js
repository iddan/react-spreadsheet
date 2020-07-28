import React from "react";
import { connect } from "unistore/react";
import * as PointSet from "./point-set";
import FloatingRect, { mapStateToProps } from "./FloatingRect";

const Selected = props => <FloatingRect {...props} variant="selected" />;

export default connect(state => {
  const cells = state.selected;
  const nextState = mapStateToProps(cells)(state);
  return {
    ...nextState,
    hidden: nextState.hidden || PointSet.size(cells) === 1,
    dragging: state.dragging
  };
})(Selected);
