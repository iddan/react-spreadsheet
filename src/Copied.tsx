import * as React from "react";
import { connect } from "unistore/react";
import * as Types from "./types";
import * as PointSet from "./point-set";
import * as PointMap from "./point-map";
import { getRangeDimensions } from "./util";
import FloatingRect, {
  Props as FloatingRectProps,
  StateProps,
} from "./FloatingRect";

type Props = Omit<FloatingRectProps, "variant">;

const Copied: React.FC<Props> = (props) => (
  <FloatingRect {...props} variant="copied" />
);

export default connect<{}, {}, Types.StoreState, StateProps>((state) => {
  const cells = state.hasPasted
    ? PointSet.from([])
    : PointMap.map(() => true, state.copied);
  const hidden = PointSet.size(cells) === 0;
  return {
    dimensions: hidden
      ? null
      : getRangeDimensions(state, PointSet.toRange(cells)),
    hidden,
    dragging: false,
  };
})(Copied);
