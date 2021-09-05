import * as React from "react";
import classNames from "classnames";
import { connect } from "unistore/react";
import * as Actions from "./actions";
import * as Selection from "./selection";
import * as Types from "./types";

export type Props = {
  selected: boolean;
  onSelect: () => void;
};

const CornerIndicator: React.FC<Props> = ({ selected, onSelect }) => {
  const handleClick = React.useCallback(() => {
    onSelect();
  }, [onSelect]);
  return (
    <th
      className={classNames("Spreadsheet__header", {
        "Spreadsheet__header--selected": selected,
      })}
      onClick={handleClick}
    />
  );
};

export const enhance = connect<
  Props,
  Omit<Props, "selected" | "onSelect">,
  Types.StoreState,
  { selected: boolean }
>(
  (state) => ({
    selected: Selection.isEntireTable(state.selected),
  }),
  { onSelect: Actions.selectEntireTable }
);

export default CornerIndicator;
