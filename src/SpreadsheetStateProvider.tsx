import * as React from "react";

import createStore from "unistore";
import devtools from "unistore/devtools";
import { Provider } from "unistore/react";
import * as Types from "./types";
import * as PointRange from "./point-range";
import * as Actions from "./actions";
import * as PointMap from "./point-map";
import * as Matrix from "./matrix";
import Spreadsheet, { Props as SpreadsheetProps } from "./Spreadsheet";

export type Props<CellType extends Types.CellBase> = Omit<
  SpreadsheetProps<CellType>,
  "store"
> & {
  onChange: (data: Matrix.Matrix<CellType>) => void;
  onModeChange: (mode: Types.Mode) => void;
  onSelect: (selected: Types.Point[]) => void;
  onActivate: (active: Types.Point) => void;
  onCellCommit: (
    prevCell: null | CellType,
    nextCell: null | CellType,
    coords: null | Types.Point
  ) => void;
  data: Matrix.Matrix<CellType>;
};

const INITIAL_STATE: Pick<
  Types.StoreState,
  | "active"
  | "mode"
  | "rowDimensions"
  | "columnDimensions"
  | "lastChanged"
  | "hasPasted"
  | "cut"
  | "dragging"
> = {
  active: null,
  mode: "view",
  rowDimensions: {},
  columnDimensions: {},
  lastChanged: null,
  hasPasted: false,
  cut: false,
  dragging: false,
};

const SpreadsheetStateProvider = <CellType extends Types.CellBase>(
  props: Props<CellType>
): React.ReactElement => {
  const { onChange, onModeChange, onSelect, onActivate, onCellCommit } = props;

  const prevStateRef = React.useRef<Types.StoreState<CellType>>({
    ...INITIAL_STATE,
    data: props.data,
    selected: null,
    copied: PointMap.from([]),
    bindings: PointMap.from([]),
    lastCommit: null,
  });

  const store = React.useMemo(() => {
    const prevState = prevStateRef.current;
    return process.env.NODE_ENV === "production"
      ? createStore(prevState)
      : devtools(createStore(prevState));
  }, []);

  const handleStoreChange = React.useCallback(
    (state: Types.StoreState<CellType>) => {
      const prevState = prevStateRef.current;

      if (state.lastCommit && state.lastCommit !== prevState.lastCommit) {
        for (const change of state.lastCommit) {
          onCellCommit(change.prevCell, change.nextCell, state.active);
        }
      }

      if (state.data !== prevState.data && state.data !== props.data) {
        onChange(state.data);
      }
      if (state.mode !== prevState.mode) {
        onModeChange(state.mode);
      }
      if (state.selected !== prevState.selected) {
        const points = state.selected
          ? Array.from(PointRange.iterate(state.selected))
          : [];
        onSelect(points);
      }
      if (state.active !== prevState.active && state.active) {
        onActivate(state.active);
      }
      prevStateRef.current = state;
    },
    [onActivate, onCellCommit, onChange, onModeChange, onSelect, props.data]
  );

  React.useEffect(() => {
    const unsubscribe = store.subscribe(handleStoreChange);
    return unsubscribe;
  }, [store, handleStoreChange]);

  React.useEffect(() => {
    const prevState = prevStateRef.current;
    if (props.data !== prevState.data) {
      const previousState = store.getState();
      const nextState = Actions.setData(previousState, props.data);
      store.setState({ ...previousState, ...nextState });
    }
  }, [props.data, store]);

  const { data: _, ...rest } = props;

  return (
    <Provider store={store}>
      {/* @ts-ignore */}
      <Spreadsheet {...rest} store={store} />
    </Provider>
  );
};

SpreadsheetStateProvider.defaultProps = {
  onChange: (): void => {},
  onModeChange: (): void => {},
  onSelect: (): void => {},
  onActivate: (): void => {},
  onCellCommit: (): void => {},
};

export default SpreadsheetStateProvider;
