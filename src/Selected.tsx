import * as React from "react";
import FloatingRect from "./FloatingRect";
import * as PointRange from "./point-range";
import { getRangeDimensions } from "./util";
import useSelector from "./use-selector";

const Selected: React.FC = () => {
  const selected = useSelector((state) => state.selected);
  const dimensions = useSelector(
    (state) =>
      selected &&
      getRangeDimensions(state.rowDimensions, state.columnDimensions, selected)
  );
  const dragging = useSelector((state) => state.dragging);
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
