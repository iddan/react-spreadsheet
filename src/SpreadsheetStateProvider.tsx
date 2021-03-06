import * as React from "react";

import createStore, { Store } from "unistore";
import devtools from "unistore/devtools";
import { Provider } from "unistore/react";
import * as Types from "./types";
import * as PointRange from "./point-range";
import * as Actions from "./actions";
import * as PointMap from "./point-map";
import * as Matrix from "./matrix";
import Spreadsheet, { Props as SpreadsheetProps } from "./Spreadsheet";

type Unsubscribe = () => void;

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

export default class SpreadsheetStateProvider<
  CellType extends Types.CellBase
> extends React.PureComponent<Props<CellType>> {
  store: Store<Types.StoreState<CellType>>;
  unsubscribe!: Unsubscribe;
  prevState: Types.StoreState<CellType>;

  static defaultProps = {
    onChange: (): void => {},
    onModeChange: (): void => {},
    onSelect: (): void => {},
    onActivate: (): void => {},
    onCellCommit: (): void => {},
  };

  constructor(props: Props<CellType>) {
    super(props);
    const state: Types.StoreState<CellType> = {
      ...INITIAL_STATE,
      data: this.props.data,
      selected: null,
      copied: PointMap.from([]),
      bindings: PointMap.from([]),
      lastCommit: null,
    };
    this.store =
      process.env.NODE_ENV === "production"
        ? createStore(state)
        : devtools(createStore(state));
    this.prevState = state;
  }

  componentDidMount(): void {
    this.unsubscribe = this.store.subscribe(
      (state: Types.StoreState<CellType>) => {
        const {
          props: { onChange, onModeChange, onSelect, onActivate, onCellCommit },
          prevState,
        } = this;

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
          const points = state.selected
            ? Array.from(PointRange.iterate(state.selected))
            : [];
          onSelect(points);
        }
        if (state.active !== prevState.active && state.active) {
          onActivate(state.active);
        }
        this.prevState = state;
      }
    );
  }

  componentDidUpdate(prevProps: Props<CellType>): void {
    if (this.props.data !== this.prevState.data) {
      const previousState = this.store.getState();
      const nextState = Actions.setData(previousState, this.props.data);
      this.store.setState({ ...previousState, ...nextState });
    }
  }

  componentWillUnmount(): void {
    this.unsubscribe();
  }

  render(): React.ReactElement {
    const { data, ...rest } = this.props;
    return (
      <Provider store={this.store}>
        {/** @ts-ignore */}
        <Spreadsheet {...rest} store={this.store} />
      </Provider>
    );
  }
}
