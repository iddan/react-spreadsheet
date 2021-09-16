import * as React from "react";
import { useContextSelector } from "use-context-selector";
import FloatingRect from "./FloatingRect";
import * as PointRange from "./point-range";
import context from "./context";
import { getRangeDimensions } from "./util";

const Selected: React.FC = () => {
  const rowDimensions = useContextSelector(
    context,
    ([state]) => state.rowDimensions
  );
  const columnDimensions = useContextSelector(
    context,
    ([state]) => state.columnDimensions
  );
  const selected = useContextSelector(context, ([state]) => state.selected);
  const dragging = useContextSelector(context, ([state]) => state.dragging);
  const dimensions = React.useMemo(
    () =>
      selected && getRangeDimensions(rowDimensions, columnDimensions, selected),
    [selected, rowDimensions, columnDimensions]
  );
  const hidden = React.useMemo(
    () => !selected || Boolean(selected && PointRange.size(selected) === 1),
    [selected]
  );
  return (
    <FloatingRect
      variant="selected"
      dimensions={dimensions}
      dragging={dragging}
      hidden={hidden}
    />
  );
};

export default Selected;
