import React from "react";
import classnames from "classnames";
import { connect } from "unistore/react";
import * as PointSet from "./point-set";
import FloatingRect, { mapStateToProps } from "./FloatingRect";

const Selected = ({ dragging, ...rest }) => (
  <FloatingRect {...rest} className={classnames("selected", { dragging })} />
);

export default connect(state => {
  const cells = state.selected;
  const nextState = mapStateToProps(cells)(state);
  return {
    ...nextState,
    hidden: nextState.hidden || PointSet.size(cells) === 1,
    dragging: state.dragging
  };
})(Selected);
