import * as React from "react";
import FloatingRect from "./FloatingRect";
import { getRangeDimensions } from "./util";
import useSelector from "./use-selector";

const Copied: React.FC = () => {
  const range = useSelector((state) => state.copied);
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
