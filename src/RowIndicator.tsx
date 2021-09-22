import * as React from "react";
import classNames from "classnames";
import { useContextSelector } from "use-context-selector";
import context from "./context";
import * as Actions from "./actions";
import * as Selection from "./selection";

export type Props = {
  row: number;
  label?: React.ReactNode | null;
  selected: boolean;
  onSelect: (row: number) => void;
};

const RowIndicator: React.FC<Props> = ({ row, label, selected, onSelect }) => {
  const handleClick = React.useCallback(() => {
    onSelect(row);
  }, [onSelect, row]);

  return (
    <th
      className={classNames("Spreadsheet__header", {
        "Spreadsheet__header--selected": selected,
      })}
      onClick={handleClick}
    >
      {label !== undefined ? label : row + 1}
    </th>
  );
};

export default RowIndicator;

export const enhance = (
  RowIndicatorComponent: React.ComponentType<Props>
): React.FC<Omit<Props, "selected" | "onSelect">> => {
  return function RowIndicatorWrapper(props) {
    const dispatch = useContextSelector(
      context,
      ([state, dispatch]) => dispatch
    );
    const selected = useContextSelector(
      context,
      ([state]) =>
        Selection.hasEntireRow(state.selected, props.row) ||
        Selection.isEntireTable(state.selected)
    );
    const selectEntireRow = React.useCallback(
      (row: number) => dispatch(Actions.selectEntireRow({ row })),
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
