import * as React from "react";
import classNames from "classnames";
import { useContextSelector } from "use-context-selector";
import * as Actions from "./actions";
import * as Selections from "./selections";
import * as Types from "./types";
import context from "./context";

const CornerIndicator: Types.CornerIndicatorComponent = ({
  selected,
  onSelect,
}) => {
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
  CornerIndicatorComponent: Types.CornerIndicatorComponent
): React.FC<Omit<Types.CornerIndicatorProps, "selected" | "onSelect">> => {
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
      Selections.isEntireTable(state.selected)
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
