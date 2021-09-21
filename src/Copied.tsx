import * as React from "react";
import FloatingRect from "./FloatingRect";
import { getCopiedRange, getRangeDimensions } from "./util";
import useSelector from "./use-selector";

const Copied: React.FC = () => {
  const range = useSelector((state) =>
    getCopiedRange(state.copied, state.hasPasted)
  );
  const dimensions = useSelector(
    (state) =>
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
