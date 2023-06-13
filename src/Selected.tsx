import * as React from "react";
import * as Actions from "./actions";
import * as Selection from "./selection";
import { getSelectedDimensions } from "./util";
import FloatingRect from "./FloatingRect";
import useSelector from "./use-selector";
import useDispatch from "./use-dispatch";
import classNames from "classnames";

const Selected: React.FC = () => {
  const selected = useSelector((state) => state.selected);
  const selectedSize = useSelector((state) =>
    Selection.size(state.selected, state.model.data)
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

const AutoFillHandle: React.FC = () => {
  const dispatch = useDispatch();

  const autoFillStart = React.useCallback(() => {
    dispatch(Actions.autoFillStart());
  }, [dispatch]);

  const autoFillEnd = React.useCallback(() => {
    dispatch(Actions.autoFillEnd());
  }, [dispatch]);

  const handleMouseDown = React.useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();

      autoFillStart();

      const handleMouseUp = () => {
        autoFillEnd();
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mouseup", handleMouseUp);
    },
    [autoFillStart, autoFillEnd]
  );

  return (
    <div
      className="Spreadsheet__auto-fill-handle"
      onMouseDown={handleMouseDown}
    />
  );
};
