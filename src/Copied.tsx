import * as React from "react";
import { connect } from "unistore/react";
import * as Types from "./types";
import { getCopiedRange, getRangeDimensions } from "./util";
import FloatingRect, {
  Props as FloatingRectProps,
  StateProps,
} from "./FloatingRect";

type Props = Omit<FloatingRectProps, "variant">;

const Copied: React.FC<Props> = (props) => (
  <FloatingRect {...props} variant="copied" dragging={false} />
);

export default connect<{}, {}, Types.StoreState, StateProps>((state) => {
  const range = getCopiedRange(state.copied, state.hasPasted);
  return {
    dimensions: range && getRangeDimensions(state, range),
    hidden: range === null,
  };
})(Copied);
