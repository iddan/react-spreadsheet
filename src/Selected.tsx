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
  const props = mapStateToProps(state, state.selected);
  return {
    ...props,
    hidden:
      props.hidden ||
      Boolean(state.selected && PointRange.size(state.selected) === 1),
    dragging: state.dragging,
  };
})(Selected);

function mapStateToProps(
  state: Types.StoreState,
  range: PointRange.PointRange | null
): Types.Dimensions & { hidden: boolean } {
  const dimensions = (range && getRangeDimensions(state, range)) || {
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  };
  return {
    ...dimensions,
    hidden: !range,
  };
}
