import * as React from "react";
import classNames from "classnames";
import * as Actions from "./actions";
import * as Selection from "./selection";
import { useContextSelector } from "use-context-selector";
import context from "./context";

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

export default CornerIndicator;

export const enhance = (
  CornerIndicatorComponent: React.FC<Props>
): React.FC<Omit<Props, "selected" | "onSelect">> => {
  return function CornerIndicatorWrapper(props) {
    const dispatch = useContextSelector(
      context,
      ([state, dispatch]) => dispatch
    );
    const selectEntireTable = React.useCallback(
      () => dispatch(Actions.selectEntireTable()),
      [dispatch]
    );
    const selected = useContextSelector(context, ([state]) =>
      Selection.isEntireTable(state.selected)
    );
    return (
      <CornerIndicatorComponent
        {...props}
        selected={selected}
        onSelect={selectEntireTable}
      />
    );
  };
};
