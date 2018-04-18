import React from "react";
import { connect } from "unistore/react";
import FloatingRect, { mapStateToProps } from "./FloatingRect";

const Selected = props => <FloatingRect {...props} className="selected" />;

export default connect(state => mapStateToProps(state.selected)(state))(
  Selected
);
