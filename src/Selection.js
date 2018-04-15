import React from "react";
import classnames from "classnames";
import { connect } from "unistore/react";
import "./Selection.css";

const Selection = ({ width, height, top, left, hidden }) => (
  <div
    className={classnames("Selection", { hidden })}
    style={{ width, height, top, left }}
  />
);

const mapStateToProps = state => ({
  hidden: true
});

export default connect(mapStateToProps)(Selection);
