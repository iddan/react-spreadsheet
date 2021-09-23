import * as React from "react";
import * as Selection from "./selection";
import { getSelectedDimensions } from "./util";
import FloatingRect from "./FloatingRect";
import useSelector from "./use-selector";

const Selected: React.FC = () => {
  const selected = useSelector((state) => state.selected);
  const dimensions = useSelector(
    (state) =>
      selected &&
      getSelectedDimensions(
        state.rowDimensions,
        state.columnDimensions,
        state.data,
        state.selected
      )
  );
  const dragging = useSelector((state) => state.dragging);
  const hidden = useSelector(
    (state) => Selection.size(state.selected, state.data) < 2
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
