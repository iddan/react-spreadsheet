import * as React from "react";
import classNames from "classnames";
import { useContextSelector } from "use-context-selector";
import * as Actions from "./actions";
import * as Selection from "./selection";
import * as Types from "./types";
import context from "./context";
import useDispatch from "./use-dispatch";
import useSelector from "./use-selector";

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
    const dispatch = useDispatch();
    const selectEntireTable = React.useCallback(
      () => dispatch(Actions.selectEntireTable()),
      [dispatch]
    );
    const selected = useSelector((state) =>
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
