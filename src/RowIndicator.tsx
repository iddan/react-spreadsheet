import * as React from "react";
import classNames from "classnames";
import { useContextSelector } from "use-context-selector";
import context from "./context";
import * as Actions from "./actions";
import * as Types from "./types";
import * as Selections from "./selections";

const RowIndicator: Types.RowIndicatorComponent = ({
  row,
  label,
  selected,
  onSelect,
  dragging,
}) => {
  const handleMouseDown = React.useCallback(() => {
    onSelect(row);
  }, [onSelect, row]);

  const handleMouseOver = React.useCallback(() => {
    if (dragging) {
      onSelect(row);
    }
  }, [onSelect, row, dragging]);

  return (
    <th
      className={classNames("Spreadsheet__header", {
        "Spreadsheet__header--selected": selected,
      })}
      onMouseDown={handleMouseDown}
      onMouseOver={handleMouseOver}
      tabIndex={0}
    >
      {label !== undefined ? label : row + 1}
    </th>
  );
};

export default RowIndicator;

export const enhance = (
  RowIndicatorComponent: Types.RowIndicatorComponent
): React.FC<
  Omit<Types.RowIndicatorProps, "selected" | "onSelect" | "dragging">
> => {
  return function RowIndicatorWrapper(props) {
    const dispatch = useContextSelector(
      context,
      ([state, dispatch]) => dispatch
    );
    const dragging = useContextSelector(context, ([state]) => state.dragging);
    const selected = useContextSelector(context, ([state]) => {
      return (
        Selections.hasEntireRow(state.selected, props.row) ||
        Selections.isEntireTable(state.selected)
      );
    });
    const selectEntireRow = React.useCallback(
      (row: number) => {
        return dispatch(Actions.selectEntireRow(row));
      },
      [dispatch]
    );
    return (
      <RowIndicatorComponent
        {...props}
        dragging={dragging}
        selected={selected}
        onSelect={selectEntireRow}
      />
    );
  };
};
