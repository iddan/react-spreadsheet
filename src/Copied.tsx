import * as React from "react";
import { connect } from "unistore/react";

import * as PointSet from "./point-set";
import * as PointMap from "./point-map";

import FloatingRect, { mapStateToProps } from "./FloatingRect";

const Copied = (props: any) => <FloatingRect {...props} className='copied' />;

export default connect((state: any) =>
  mapStateToProps(
    state.hasPasted ? PointSet.from([]) : PointMap.map(() => true, state.copied)
  )(state)
)(Copied);
