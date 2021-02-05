import * as React from "react";
import { connect } from "unistore/react";
import * as Types from "./types";
import * as PointSet from "./point-set";
import FloatingRect, {
  Props as FloatingRectProps,
  mapStateToProps as mapStateToFloatingRectProps,
} from "./FloatingRect";

const Selected: React.FC<FloatingRectProps> = (props) => (
  <FloatingRect {...props} variant="selected" />
);

export default connect<
  FloatingRectProps,
  {},
  Types.StoreState,
  Types.Dimensions & { hidden: boolean }
>((state) => {
  const cells = state.selected;
  const props = mapStateToFloatingRectProps(state, cells);
  return {
    ...props,
    hidden: props.hidden || PointSet.size(cells) === 1,
    dragging: state.dragging,
  };
})(Selected);
