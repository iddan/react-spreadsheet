import * as React from "react";
import * as Selection from "./selection";
import { getSelectedDimensions } from "./util";
import { useContextSelector } from "use-context-selector";
import FloatingRect from "./FloatingRect";
import context from "./context";

const Selected: React.FC = () => {
  const selected = useContextSelector(context, ([state]) => state.selected);
  const dimensions = useContextSelector(
    context,
    ([state]) =>
      selected &&
      getSelectedDimensions(
        state.rowDimensions,
        state.columnDimensions,
        state.data,
        state.selected
      )
  );
  const dragging = useContextSelector(context, ([state]) => state.dragging);
  const hidden = useContextSelector(
    context,
    ([state]) => Selection.size(state.selected, state.data) < 2
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
