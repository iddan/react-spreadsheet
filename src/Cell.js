// @flow

import React, { PureComponent } from "react";
import classnames from "classnames";
import { connect } from "unistore/react";
import type { Parser as FormulaParser } from "hot-formula-parser";
import * as PointSet from "./point-set";
import * as Matrix from "./matrix";
import * as Types from "./types";
import * as Actions from "./actions";
import { isActive, getOffsetRect } from "./util";

type StaticProps<Data, Value> = {|
  row: number,
  column: number,
  DataViewer: Types.DataViewer<Data, Value>,
  getValue: Types.getValue<Data, Value>,
  formulaParser: FormulaParser
|};

export type { StaticProps as Props };

type State<Data> = {|
  data: ?Data
|};

type Handlers<Data> = {|
  setData: (data: Data) => void,
  select: (cellPointer: Types.Point) => void,
  activate: (cellPointer: Types.Point) => void,
  setCellDimensions: (point: Types.Point, dimensions: Types.Dimensions) => void
|};

type Props<Data, Value> = {|
  ...StaticProps<Data, Value>,
  ...State<Data>,
  ...Handlers<Data>
|};

export class Cell<
  Data: ?{ readOnly?: boolean, DataViewer: Types.DataViewer<*, *> },
  Value
> extends PureComponent<Props<Data, Value>> {
  /** @todo update to new API */
  root: HTMLElement | null;
  handleRoot = (root: HTMLElement | null) => {
    this.root = root;
  };

  handleMouseDown = (e: SyntheticMouseEvent<HTMLElement>) => {
    const {
      row,
      column,
      setCellDimensions,
      select,
      activate,
      store
    } = this.props;
    if (store.getState().mode === "view") {
      setCellDimensions({ row, column }, getOffsetRect(e.currentTarget));

      if (e.shiftKey) {
        select({ row, column });
        return;
      }

      activate({ row, column });
    }
  };

  handleMouseOver = (e: SyntheticMouseEvent<*>) => {
    const { row, column, setCellDimensions, select, store } = this.props;
    if (store.getState().dragging) {
      setCellDimensions({ row, column }, getOffsetRect(e.currentTarget));
      select({ row, column });
    }
  };

  handleChange = (cell: Data) => {
    const { setData } = this.props;
    setData(cell);
  };

  prevState = this.props.store.getState();
  selected: boolean;

  measure = () => {
    if (this.selected && this.root) {
      const { row, column } = this.props;
      this.props.setCellDimensions({ row, column }, getOffsetRect(this.root));
    }
  };

  componentDidMount() {
    const { row, column } = this.props;
    this.props.store.subscribe(state => {
      if (state.selected !== this.prevState.selected) {
        this.selected = PointSet.has(state.selected, { row, column });
        this.measure();
      }
      this.prevState = state;
    });
  }

  componentDidUpdate() {
    const { row, column, store } = this.props;
    const state = store.getState();
    const point = { row, column };
    if (this.selected && this.root) {
      this.measure();
    }

    if (this.root && isActive(state.active, point) && state.mode === "view") {
      this.root.focus();
    }
  }

  render() {
    const { row, column, getValue, formulaParser } = this.props;
    let { DataViewer, data } = this.props;
    if (data && data.DataViewer) {
      ({ DataViewer, ...data } = data);
    }

    return (
      <td
        ref={this.handleRoot}
        className={classnames({
          readonly: data && data.readOnly
        })}
        onMouseOver={this.handleMouseOver}
        onMouseDown={this.handleMouseDown}
        tabIndex={0}
      >
        <DataViewer
          row={row}
          column={column}
          cell={data}
          getValue={getValue}
          formulaParser={formulaParser}
        />
      </td>
    );
  }
}

function mapStateToProps<Data>(
  { data, hasPasted }: Types.StoreState<Data>,
  { column, row }: Props<Data, *>
): State<Data> {
  return {
    data: Matrix.get(row, column, data)
  };
}

export const enhance = connect(
  mapStateToProps,
  {
    select: Actions.select,
    activate: Actions.activate,
    setData: Actions.setData,
    setCellDimensions: Actions.setCellDimensions
  }
);
