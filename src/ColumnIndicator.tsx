import * as React from "react";
import classNames from "classnames";
import { columnIndexToLabel } from "hot-formula-parser";
import * as Actions from "./actions";
import * as Selection from "./selection";
import * as Types from "./types";
import { useContextSelector } from "use-context-selector";
import context from "./context";
import { useCallback } from "@storybook/addons";

export type Props = {
  column: number;
  label?: React.ReactNode | null;
  selected: boolean;
  onSelect: (column: number) => void;
};

const ColumnIndicator: React.FC<Props> = ({
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
  ColumnIndicatorComponent: React.ComponentType<Props>
): React.FC<Omit<Props, "selected" | "onSelect">> => {
  return function ColumnIndicatorWrapper(props) {
    const dispatch = useContextSelector(
      context,
      ([state, dispatch]) => dispatch
    );
    const selectEntireColumn = useCallback(
      (column: number) => dispatch(Actions.selectEntireColumn({ column })),
      [dispatch]
    );
    const selected = useContextSelector(
      context,
      ([state]) =>
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
