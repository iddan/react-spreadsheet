import React, { Component } from "react";
import shallowEqual from "fbjs/lib/shallowEqual";
import createStore, { Store } from "unistore";
import devtools from "unistore/devtools";
import { Provider } from "unistore/react";

import * as Types from "./types";
import { IPoint, IStoreState } from "./types";
import * as Actions from "./actions";
import * as PointSet from "./point-set";
import * as PointMap from "./point-map";
import * as Matrix from "./matrix";
import Spreadsheet, { Props as SpreadsheetProps } from "./Spreadsheet";

export { createEmptyMatrix } from "./util";

type Unsubscribe = () => void;

export interface IProps<CellType, Value>
  extends SpreadsheetProps<CellType, Value> {
  onChange: (data: Matrix.Matrix<CellType>) => void;
  onModeChange: (mode: Types.Mode) => void;
  onSelect: (selected: IPoint[]) => void;
  onActivate: (active: IPoint) => void;
  onCellCommit: (
    prevCell: null | CellType,
    nextCell: null | CellType,
    coords: IPoint
  ) => void;
}

const initialState: Partial<IStoreState<any>> = {
  selected: PointSet.from([]),
  copied: PointMap.from([]),
  active: null,
  mode: "view",
  rowDimensions: {},
  columnDimensions: {},
  lastChanged: null,
  bindings: PointMap.from([])
};

export default class SpreadsheetStateProvider<
  CellType,
  Value
> extends Component<IProps<CellType, Value>, IStoreState<CellType>> {
  store: Store<any>;
  unsubscribe: Unsubscribe;
  prevState: IStoreState<CellType>;

  static defaultProps = {
    onChange: () => {},
    onModeChange: () => {},
    onSelect: () => {},
    onActivate: () => {},
    onCellCommit: () => {}
  };

  constructor(props: IProps<CellType, Value>) {
    super(props);
    const state: IStoreState<CellType> = {
      ...initialState,
      data: this.props.data
    };
    this.unsubscribe = () => {};
    this.store =
      process.env.NODE_ENV === "production"
        ? createStore(state)
        : devtools(createStore(state));
    this.prevState = state;
  }

  shouldComponentUpdate(nextProps: IProps<CellType, Value>) {
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
      onCellCommit
    } = this.props;
    this.unsubscribe = this.store.subscribe(
      (state: Types.IStoreState<CellType>) => {
        const { prevState } = this;

        if (state.lastCommit && state.lastCommit !== prevState.lastCommit) {
          for (const change of state.lastCommit) {
            if (state.active) {
              onCellCommit(change.prevCell, change.nextCell, state.active);
            }
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

  componentDidUpdate() {
    if (this.props.data !== this.prevState.data) {
      this.store.setState(
        Actions.setData(this.store.getState(), this.props.data)
      );
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const { data, ...rest } = this.props;
    return (
      <Provider store={this.store}>
        <Spreadsheet {...rest} store={this.store} />
      </Provider>
    );
  }
}
