import React from "react";
import classnames from "classnames";
import { connect } from "unistore/react";
import FloatingRect, { mapStateToProps } from "./FloatingRect";

const Selected = ({ dragging, ...rest }) => (
  <FloatingRect {...rest} className={classnames("selected", { dragging })} />
);

export default connect(state => ({
  ...mapStateToProps(state.selected)(state),
  dragging: state.dragging
}))(Selected);
