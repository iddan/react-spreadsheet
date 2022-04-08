import * as React from "react";
import classNames from "classnames";
import { columnIndexToLabel } from "hot-formula-parser";
import * as Types from "./types";
import * as Actions from "./actions";
import * as Selection from "./selection";
import useDispatch from "./use-dispatch";
import useSelector from "./use-selector";

const ColumnIndicator: Types.ColumnIndicatorComponent = ({
  column,
  label,
  selected,
  onSelect,
}) => {
  const handleClick = React.useCallback(
    (event: React.MouseEvent) => {
      onSelect(column, event.shiftKey);
    },
    [onSelect, column]
  );
  return (
    <th
      className={classNames("Spreadsheet__header", {
        "Spreadsheet__header--selected": selected,
      })}
      onClick={handleClick}
      tabIndex={0}
    >
      {label !== undefined ? label : columnIndexToLabel(String(column))}
    </th>
  );
};

export default ColumnIndicator;

export const enhance = (
  ColumnIndicatorComponent: Types.ColumnIndicatorComponent
): React.FC<Omit<Types.ColumnIndicatorProps, "selected" | "onSelect">> => {
  return function ColumnIndicatorWrapper(props) {
    const dispatch = useDispatch();
    const selectEntireColumn = React.useCallback(
      (column: number, extend: boolean) =>
        dispatch(Actions.selectEntireColumn(column, extend)),
      [dispatch]
    );
    const selected = useSelector(
      (state) =>
        Selection.hasEntireColumn(state.selected, props.column) ||
        Selection.isEntireTable(state.selected)
    );
    return (
      <ColumnIndicatorComponent
        {...props}
        selected={selected}
        onSelect={selectEntireColumn}
      />
    );
  };
};
