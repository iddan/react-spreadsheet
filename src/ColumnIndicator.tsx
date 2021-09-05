import * as React from "react";
import classNames from "classnames";
import { columnIndexToLabel } from "hot-formula-parser";
import { connect } from "unistore/react";
import * as Actions from "./actions";
import * as Selection from "./selection";
import * as Types from "./types";

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

export const enhance = connect(
  (state: Types.StoreState, props: Props) => ({
    selected: Selection.hasEntireColumn(state.selected, props.column),
  }),
  {
    onSelect: Actions.selectEntireColumn,
  }
);

export default ColumnIndicator;
