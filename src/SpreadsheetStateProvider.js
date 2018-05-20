// @flow
import React, { PureComponent } from "react";
import createStore from "unistore";
import devtools from "unistore/devtools";
import { Provider } from "unistore/react";
import * as Types from "./types";
import * as PointSet from "./point-set";
import * as PointMap from "./point-map";
import * as Matrix from "./matrix";
import Spreadsheet, { type Props as SpreadsheetProps } from "./Spreadsheet";

type Unsubscribe = () => void;

export type Props<CellType, Value> = {|
  ...SpreadsheetProps<CellType, Value>,
  onChange: (data: Matrix.Matrix<CellType>) => void,
  onModeChange: (mode: Types.Mode) => void,
  onSelect: (selected: Types.Point[]) => void,
  onActivate: (active: Types.Point) => void
|};

const initialState: $Shape<Types.StoreState<any>> = {
  selected: PointSet.from([]),
  copied: PointMap.from([]),
  active: null,
  mode: "view",
  cellDimensions: PointMap.from([])
};

export default class SpreadsheetStateProvider<
  CellType,
  Value
> extends PureComponent<Props<CellType, Value>> {
  store: Object;
  unsubscribe: Unsubscribe;
  prevState: Types.StoreState<CellType>;

  static defaultProps = {
    onChange: () => {},
    onModeChange: () => {},
    onSelect: () => {},
    onActivate: () => {}
  };

  constructor(props: Props<CellType, Value>) {
    super(props);
    const state: Types.StoreState<CellType> = {
      ...initialState,
      data: this.props.data
    };
    this.store =
      process.env.NODE_ENV === "production"
        ? createStore(state)
        : devtools(createStore(state));
    this.prevState = state;
  }

  componentDidMount() {
    const { onChange, onModeChange, onSelect, onActivate } = this.props;
    this.unsubscribe = this.store.subscribe(
      (state: Types.StoreState<CellType>) => {
        const { prevState } = this;
        if (state.data !== prevState.data) {
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
    if (prevProps.data !== this.props.data) {
      this.store.setState({ data: this.props.data });
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const { data, ...rest } = this.props;
    console.log(this.store.getState());
    return (
      <Provider store={this.store}>
        <Spreadsheet {...rest} store={this.store} />
      </Provider>
    );
  }
}
