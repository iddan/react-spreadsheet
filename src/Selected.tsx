import * as React from "react";
import { connect } from "unistore/react";
import * as Types from "./types";
import * as PointSet from "./point-set";
import FloatingRect, {
  Props as FloatingRectProps,
  StateProps,
  mapStateToProps as mapStateToFloatingRectProps,
} from "./FloatingRect";

type Props = Omit<FloatingRectProps, "variant">;

const Selected: React.FC<Props> = (props) => (
  <FloatingRect {...props} variant="selected" />
);

export default connect<{}, {}, Types.StoreState, StateProps>((state) => {
  const cells = state.selected;
  const props = mapStateToFloatingRectProps(state, cells);
  return {
    ...props,
    hidden: props.hidden || PointSet.size(cells) === 1,
    dragging: state.dragging,
  };
})(Selected);
