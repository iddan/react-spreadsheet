import * as React from "react";
import { useContextSelector } from "use-context-selector";
import FloatingRect from "./FloatingRect";
import * as PointRange from "./point-range";
import context from "./context";
import { getRangeDimensions } from "./util";

const Selected: React.FC = () => {
  const selected = useContextSelector(context, ([state]) => state.selected);
  const dimensions = useContextSelector(
    context,
    ([state]) =>
      selected &&
      getRangeDimensions(state.rowDimensions, state.columnDimensions, selected)
  );
  const dragging = useContextSelector(context, ([state]) => state.dragging);
  const hidden = React.useMemo(() => isHidden(selected), [selected]);
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

export function isHidden(selected: PointRange.PointRange | null): boolean {
  return !selected || Boolean(selected && PointRange.size(selected) === 1);
}
