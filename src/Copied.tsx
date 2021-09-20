import * as React from "react";
import { useContextSelector } from "use-context-selector";
import FloatingRect from "./FloatingRect";
import context from "./context";
import { getCopiedRange, getRangeDimensions } from "./util";

const Copied: React.FC = () => {
  const range = useContextSelector(context, ([state]) =>
    getCopiedRange(state.copied, state.hasPasted)
  );
  const dimensions = useContextSelector(
    context,
    ([state]) =>
      range &&
      getRangeDimensions(state.rowDimensions, state.columnDimensions, range)
  );
  const hidden = range === null;

  return (
    <FloatingRect
      variant="copied"
      dimensions={dimensions}
      hidden={hidden}
      dragging={false}
    />
  );
};

export default Copied;
