import * as React from "react";
import classNames from "classnames";
import * as Actions from "./actions";
import * as Types from "./types";
import * as Selection from "./selection";
import useDispatch from "./use-dispatch";
import useSelector from "./use-selector";

const RowIndicator: Types.RowIndicatorComponent = ({
  row,
  label,
  selected,
  onSelect,
  width,
}) => {
  const handleClick = React.useCallback(
    (event: React.MouseEvent) => {
      onSelect(row, event.shiftKey);
    },
    [onSelect, row]
  );

  return (
    <div
      role="columnheader"
      className={classNames("Spreadsheet__header", {
        "Spreadsheet__header--selected": selected,
      })}
      onClick={handleClick}
      tabIndex={0}
      style={{ width }}
    >
      {label !== undefined ? label : row + 1}
    </div>
  );
};

export default RowIndicator;

export const enhance = (
  RowIndicatorComponent: Types.RowIndicatorComponent
): React.FC<Omit<Types.RowIndicatorProps, "selected" | "onSelect">> => {
  return function RowIndicatorWrapper(props) {
    const dispatch = useDispatch();
    const selected = useSelector(
      (state) =>
        Selection.hasEntireRow(state.selected, props.row) ||
        Selection.isEntireTable(state.selected)
    );
    const selectEntireRow = React.useCallback(
      (row: number, extend: boolean) =>
        dispatch(Actions.selectEntireRow(row, extend)),
      [dispatch]
    );
    return (
      <RowIndicatorComponent
        {...props}
        selected={selected}
        onSelect={selectEntireRow}
      />
    );
  };
};
