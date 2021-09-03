import * as React from "react";
import { connect } from "unistore/react";
import * as Types from "./types";
import FloatingRect, {
  Props as FloatingRectProps,
  StateProps,
} from "./FloatingRect";
import * as Selection from "./selection";
import { getSelectedDimensions } from "./util";

type Props = Omit<FloatingRectProps, "variant">;

const Selected: React.FC<Props> = (props) => (
  <FloatingRect {...props} variant="selected" />
);

export default connect<{}, {}, Types.StoreState, StateProps>((state) => ({
  dimensions: getSelectedDimensions(state),
  hidden: Selection.size(state.selected, state.data) < 2,
  dragging: state.dragging,
}))(Selected);
