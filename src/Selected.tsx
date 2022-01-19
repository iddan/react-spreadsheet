import * as React from "react";
import * as PointRange from "./point-range";
import * as Selection from "./selection";
import * as Types from "./types";
import { getSelectedDimensions } from "./util";
import FloatingRect from "./FloatingRect";
import useSelector from "./use-selector";

const ItemSelected: Types.ItemSelectedComponent = ({ selection, dragging }) => {
  const dimensions = useSelector(
    (state) =>
      selection &&
      getSelectedDimensions(
        state.rowDimensions,
        state.columnDimensions,
        state.data,
        selection
      )
  );
  const hidden = useSelector(
    (state) => Selection.size(selection, state.data) < 2
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

const Selected: React.FC = () => {
  const selected = useSelector((state) => state.selected);
  const dragging = useSelector((state) => state.dragging);

  const getSelectionId = (selection: Selection.Selection) => {
    if (!selection) {
      return "";
    }

    if (PointRange.is(selection)) {
      return `selection-range-${selection.start.row}-${selection.end.row}`;
    }
    switch (selection.type) {
      case Selection.EntireType.Row:
        return `selection-row-${selection.start}-${selection.end}`;
      case Selection.EntireType.Column:
        return `selection-row-${selection.start}-${selection.end}`;
      case Selection.EntireType.Table:
        return "selection-table";
    }
  };

  const renderSelection = (selection: Selection.Selection) => {
    if (!selection) {
      return null;
    }
    return (
      <ItemSelected
        selection={selection}
        dragging={dragging}
        key={getSelectionId(selection)}
      />
    );
  };

  return selected.length ? (
    <>{selected.map(renderSelection)}</>
  ) : (
    <FloatingRect variant="selected" hidden />
  );
};

export default Selected;
