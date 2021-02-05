import * as React from "react";
import { connect } from "unistore/react";
import * as Types from "./types";
import * as PointSet from "./point-set";
import * as PointMap from "./point-map";
import FloatingRect, {
  Props as FloatingRectProps,
  mapStateToProps,
} from "./FloatingRect";

const Copied = (props: FloatingRectProps): React.ReactElement => (
  <FloatingRect {...props} variant="copied" />
);

export default connect((state: Types.StoreState) =>
  mapStateToProps(
    state.hasPasted ? PointSet.from([]) : PointMap.map(() => true, state.copied)
  )(state)
)(Copied);
