import * as React from "react";
import classNames from "classnames";
import { connect } from "unistore/react";
import * as Actions from "./actions";
import * as Types from "./types";
import * as Selection from "./selection";

export type Props = {
  row: number;
  label?: React.ReactNode | null;
  selected: boolean;
  onSelect: (row: number) => void;
};

export const RowIndicator: React.FC<Props> = ({
  row,
  label,
  selected,
  onSelect,
}) => {
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

export const enhance = connect(
  (state: Types.StoreState<Types.CellBase>, props: Props) => {
    return {
      selected: Selection.hasEntireRow(state.selected, props.row),
    };
  },
  {
    onSelect: Actions.selectEntireRow,
  }
);

export default RowIndicator;
