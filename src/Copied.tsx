import * as React from "react";
import { connect } from "unistore/react";
import * as Types from "./types";
import * as PointSet from "./point-set";
import * as PointMap from "./point-map";
import FloatingRect, {
  Props as FloatingRectProps,
  mapStateToProps as mapStateToFloatingRectProps,
} from "./FloatingRect";

const Copied: React.FC<FloatingRectProps> = (props) => (
  <FloatingRect {...props} variant="copied" />
);

export default connect<
  FloatingRectProps,
  {},
  Types.StoreState,
  Types.Dimensions & { hidden: boolean }
>((state) => {
  const cells = state.hasPasted
    ? PointSet.from([])
    : PointMap.map(() => true, state.copied);
  return mapStateToFloatingRectProps(state, cells);
})(Copied);
