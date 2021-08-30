import * as React from "react";
import { connect } from "unistore/react";
import * as Types from "./types";
import FloatingRect, {
  Props as FloatingRectProps,
  StateProps,
} from "./FloatingRect";
import * as PointRange from "./point-range";
import { getRangeDimensions } from "./util";

type Props = Omit<FloatingRectProps, "variant">;

const Selected: React.FC<Props> = (props) => (
  <FloatingRect {...props} variant="selected" />
);

export default connect<{}, {}, Types.StoreState, StateProps>((state) => {
  const dimensions =
    state.selected && getRangeDimensions(state, state.selected);
  return {
    dimensions,
    hidden:
      !state.selected ||
      Boolean(state.selected && PointRange.size(state.selected) === 1),
    dragging: state.dragging,
  };
})(Selected);
