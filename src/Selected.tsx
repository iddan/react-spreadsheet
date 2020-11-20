import * as React from "react";
import { connect } from "unistore/react";
import * as Types from "./types";
import * as PointSet from "./point-set";
import FloatingRect, { Props, mapStateToProps } from "./FloatingRect";

const Selected = (props: Props): React.ReactElement => (
  <FloatingRect {...props} variant="selected" />
);

export default connect(
  (state: Types.StoreState<unknown, unknown>): Partial<Props> => {
    const cells = state.selected;
    const nextState = mapStateToProps(cells)(state);
    return {
      ...nextState,
      hidden: nextState.hidden || PointSet.size(cells) === 1,
      dragging: state.dragging,
    };
  }
)(Selected);
