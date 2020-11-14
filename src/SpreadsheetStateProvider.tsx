import * as React from "react";
import shallowEqual from "fbjs/lib/shallowEqual";

import createStore, { Store } from "unistore";
import devtools from "unistore/devtools";
import { Provider } from "unistore/react";
import * as Types from "./types";
import * as PointSet from "./point-set";
import * as Actions from "./actions";
import * as PointMap from "./point-map";
import * as Matrix from "./matrix";
import Spreadsheet, { Props as SpreadsheetProps } from "./Spreadsheet";

type Unsubscribe = () => void;

export type Props<CellType, Value> = {
  onChange: (data: Matrix.Matrix<CellType>) => void;
  onModeChange: (mode: Types.Mode) => void;
  onSelect: (selected: Types.Point[]) => void;
  onActivate: (active: Types.Point) => void;
  onCellCommit: (
    prevCell: null | CellType,
    nextCell: null | CellType,
    coords: null | Types.Point
  ) => void;
} & SpreadsheetProps<CellType, Value>;

const initialState: Partial<Types.StoreState<any>> = {
  selected: PointSet.from([]),
  copied: PointMap.from([]),
  active: null,
  mode: "view",
  rowDimensions: {},
  columnDimensions: {},
  lastChanged: null,
  bindings: PointMap.from([]),
};

export default class SpreadsheetStateProvider<
  CellType extends Types.CellBase,
  Value
> extends React.Component<Props<CellType, Value>> {
  store: Store<Types.StoreState<CellType>>;
  unsubscribe: Unsubscribe;
  prevState: Types.StoreState<CellType>;

  static defaultProps = {
    onChange: () => {},
    onModeChange: () => {},
    onSelect: () => {},
    onActivate: () => {},
    onCellCommit: () => {},
  };

  constructor(props: Props<CellType, Value>) {
    super(props);
    const state: Types.StoreState<CellType> = {
      ...initialState,
      data: this.props.data,
    };
    this.store =
      process.env.NODE_ENV === "production"
        ? createStore(state)
        : devtools(createStore(state));
    this.prevState = state;
  }

  shouldComponentUpdate(nextProps: Props<CellType, Value>): boolean {
    const { data, ...rest } = this.props;
    const { data: nextData, ...nextRest } = nextProps;
    return !shallowEqual(rest, nextRest) || nextData !== this.prevState.data;
  }

  componentDidMount() {
    const {
      onChange,
      onModeChange,
      onSelect,
      onActivate,
      onCellCommit,
    } = this.props;
    this.unsubscribe = this.store.subscribe(
      (state: Types.StoreState<CellType>) => {
        const { prevState } = this;

        if (state.lastCommit && state.lastCommit !== prevState.lastCommit) {
          for (const change of state.lastCommit) {
            onCellCommit(change.prevCell, change.nextCell, state.active);
          }
        }

        if (state.data !== prevState.data && state.data !== this.props.data) {
          onChange(state.data);
        }
        if (state.mode !== prevState.mode) {
          onModeChange(state.mode);
        }
        if (state.selected !== prevState.selected) {
          onSelect(PointSet.toArray(state.selected));
        }
        if (state.active !== prevState.active && state.active) {
          onActivate(state.active);
        }
        this.prevState = state;
      }
    );
  }

  componentDidUpdate(prevProps: Props<CellType, Value>) {
    if (this.props.data !== this.prevState.data) {
      this.store.setState(
        Actions.setData(this.store.getState(), this.props.data)
      );
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render(): React.ReactNode {
    const { data, ...rest } = this.props;
    return (
      <Provider store={this.store}>
        <Spreadsheet {...rest} store={this.store} />
      </Provider>
    );
  }
}