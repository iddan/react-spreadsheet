import * as React from "react";
import * as Actions from "./actions";
import useDispatch from "./use-dispatch";

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

export default AutoFillHandle;

