import * as React from "react";
import { useContextSelector } from "use-context-selector";
import * as PointSet from "./point-set";
import { convertPointMapToPointSet, getRangeDimensions } from "./util";
import FloatingRect from "./FloatingRect";
import context from "./context";

const Copied: React.FC = () => {
  const rowDimensions = useContextSelector(
    context,
    ([state]) => state.rowDimensions
  );
  const columnDimensions = useContextSelector(
    context,
    ([state]) => state.columnDimensions
  );
  const copied = useContextSelector(context, ([state]) =>
    state.hasPasted ? null : state.copied
  );
  const copiedSet = React.useMemo(
    () => copied && convertPointMapToPointSet(copied),
    [copied]
  );
  const hidden = React.useMemo(
    () => !copiedSet || PointSet.size(copiedSet) === 0,
    [copiedSet]
  );
  const dimensions = React.useMemo(
    () =>
      hidden || !copiedSet
        ? null
        : getRangeDimensions(
            rowDimensions,
            columnDimensions,
            PointSet.toRange(copiedSet)
          ),
    [rowDimensions, columnDimensions, hidden, copiedSet]
  );

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
