import * as React from "react";
import { getSelectedDimensions } from "./util";
import FloatingRect from "./FloatingRect";
import useSelector from "./use-selector";
import classNames from "classnames";
import AutoFillHandle from "./AutoFillHandle";

const Selected: React.FC = () => {
  const selected = useSelector((state) => state.selected);
  const selectedSize = useSelector((state) =>
    state.selected.size(state.model.data)
  );
  const dimensions = useSelector(
    (state) =>
      selected &&
      getSelectedDimensions(
        state.rowDimensions,
        state.columnDimensions,
        state.model.data,
        state.selected
      )
  );
  const dragging = useSelector((state) => state.dragging);
  const autoFilling = useSelector((state) => state.autoFilling);
  const hidden = selectedSize === 0;

  return (
    <FloatingRect
      variant="selected"
      dimensions={dimensions}
      dragging={dragging}
      hidden={hidden}
      className={classNames({
        "Spreadsheet__selected-single": selectedSize === 1,
      })}
      autoFilling={autoFilling}
    >
      {!hidden && <AutoFillHandle />}
    </FloatingRect>
  );
};

export default Selected;
