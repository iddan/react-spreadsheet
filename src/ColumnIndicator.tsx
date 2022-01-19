import * as React from "react";
import classNames from "classnames";
import { columnIndexToLabel } from "hot-formula-parser";
import { useContextSelector } from "use-context-selector";
import * as Types from "./types";
import * as Actions from "./actions";
import * as Selections from "./selections";
import context from "./context";

const ColumnIndicator: Types.ColumnIndicatorComponent = ({
  column,
  label,
  selected,
  onSelect,
}) => {
  const handleClick = React.useCallback(() => {
    onSelect(column);
  }, [onSelect, column]);
  return (
    <th
      className={classNames("Spreadsheet__header", {
        "Spreadsheet__header--selected": selected,
      })}
      onClick={handleClick}
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
    const dispatch = useContextSelector(
      context,
      ([state, dispatch]) => dispatch
    );
    const selectEntireColumn = React.useCallback(
      (column: number) => dispatch(Actions.selectEntireColumn(column)),
      [dispatch]
    );
    const selected = useContextSelector(
      context,
      ([state]) =>
        Selections.hasEntireColumn(state.selected, props.column) ||
        Selections.isEntireTable(state.selected)
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
