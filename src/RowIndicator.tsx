import * as React from "react";
import classNames from "classnames";
import * as Actions from "./actions";
import * as Types from "./types";
import useDispatch from "./use-dispatch";
import useSelector from "./use-selector";

const RowIndicator: Types.RowIndicatorComponent<string> = ({
  row,
  label,
  selected,
  onSelect,
}) => {
  const handleClick = React.useCallback(
    (event: React.MouseEvent) => {
      onSelect(row, event.shiftKey);
    },
    [onSelect, row]
  );

  return (
    <th
      className={classNames("Spreadsheet__header", {
        "Spreadsheet__header--selected": selected,
      })}
      onClick={handleClick}
      tabIndex={0}
    >
      {label !== undefined ? label : row + 1}
    </th>
  );
};

export default RowIndicator;

export const enhance = <Label,>(
  RowIndicatorComponent: Types.RowIndicatorComponent<Label>
): React.FC<Omit<Types.RowIndicatorProps<Label>, "selected" | "onSelect">> => {
  return function RowIndicatorWrapper(props) {
    const dispatch = useDispatch();
    const selected = useSelector((state) =>
      state.selected.hasEntireRow(props.row)
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
