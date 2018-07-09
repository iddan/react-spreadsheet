// @flow
import React, { Component } from "react";
import classnames from "classnames";
import { connect } from "unistore/react";
import * as Matrix from "./matrix";
import * as PointMap from "./point-map";
import * as Actions from "./actions";
import * as Types from "./types";

type Props<Cell, Value> = {|
  ...Types.Point,
  ...Types.Dimensions,
  DataEditor: Types.DataEditor<Cell, Value>,
  getValue: Types.getValue<Cell, Value>,
  onChange: (data: Cell) => void,
  setData: (data: Cell, bindings: Types.Point[]) => void,
  cell: Cell,
  hidden: boolean,
  mode: Types.Mode,
  edit: () => void,
  getBindingsForCell: Types.getBindingsForCell<Cell>
|};

type State<Cell> = {
  localCell: ?Cell
};

class ActiveCell<Cell, Value> extends Component<
  Props<Cell, Value>,
  State<Cell>
> {
  /** @todo update API */
  state: State<Cell> = { localCell: undefined };

  handleChange = cell => {
    this.setState({ localCell: cell });
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.cell !== this.props.cell) {
      this.setState({ localCell: nextProps.cell });
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.mode === "view" && prevProps.mode === "edit") {
      const { setData, getBindingsForCell } = this.props;
      const { row, column } = prevProps;
      const { localCell } = this.state;
      const bindings = getBindingsForCell(localCell);
      setData({ row, column }, localCell, bindings);
      this.setState({ localCell: undefined });
    }
  }

  render() {
    let { DataEditor } = this.props;
    const {
      getValue,
      row,
      column,
      width,
      height,
      top,
      left,
      hidden,
      mode,
      edit
    } = this.props;
    const cell = this.state.localCell || this.props.cell;
    DataEditor = (cell && cell.DataEditor) || DataEditor;
    return hidden ? null : (
      <div
        className={classnames("ActiveCell", mode)}
        style={{ width, height, top, left }}
        onClick={mode === "view" ? edit : undefined}
      >
        {mode === "edit" && (
          <DataEditor
            row={row}
            column={column}
            cell={cell}
            onChange={this.handleChange}
            getValue={getValue}
          />
        )}
      </div>
    );
  }
}

const EmptyDimensions = {
  width: 0,
  height: 0,
  top: 0,
  left: 0
};

const mapStateToProps = (state: Types.StoreState<*>) => {
  const { mode } = state;
  if (!state.active || !PointMap.has(state.active, state.cellDimensions)) {
    return { mode, hidden: true };
  }
  const dimensions =
    PointMap.get(state.active, state.cellDimensions) || EmptyDimensions;
  return {
    mode,
    hidden: false,
    ...state.active,
    // $FlowFixMe
    cell: Matrix.get(state.active.row, state.active.column, state.data),
    width: dimensions.width,
    height: dimensions.height,
    top: dimensions.top,
    left: dimensions.left
  };
};

export default connect(
  mapStateToProps,
  {
    setData: Actions.setData,
    edit: Actions.edit
  }
)(ActiveCell);
