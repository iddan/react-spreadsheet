// @flow

import React, { PureComponent } from "react";
import Composer from "react-composer";
import classnames from "classnames";
import * as Contexts from "./contexts";
import * as Types from "./types";

export type Props<CellType, Value> = {
  row: number,
  column: number,
  DataEditor: Types.DataEditor<CellType, Value>,
  DataViewer: Types.DataViewer<CellType, Value>,
  getValue: Types.getValue<CellType, Value>,
  onChange: Types.onChange<Value>
};

const EMPTY =
  typeof Symbol === "function" ? Symbol("EMPTY") : "@@REACT_SPREADSHEET/EMPTY";

type State<Value> = {
  localValue: Value | typeof EMPTY
};

class Cell<CellType, Value> extends React.PureComponent<
  Props<CellType, Value> & {
    cell: CellType,
    isActive: boolean,
    mode: Types.Mode
  },
  State<Value>
> {
  state = { localValue: EMPTY };

  handleChange = localValue => {
    this.setState({ localValue });
  };

  componentWillReceiveProps(nextProps) {
    const { localValue } = this.state;
    if (localValue !== EMPTY) {
      if (nextProps.mode === "view" && this.props.mode === "edit") {
        const { row, column, onChange } = nextProps;
        onChange({ row, column, value: localValue });
      }
      if (nextProps.mode === "view" && this.props.mode === "view") {
        this.setState({ localValue: EMPTY });
      }
    }
  }

  render() {
    const {
      isActive,
      cell,
      mode,
      row,
      column,
      DataViewer,
      DataEditor,
      getValue
    } = this.props;
    const { localValue } = this.state;
    return (
      <td
        className={classnames(mode, {
          active: isActive,
          readonly: cell && cell.readOnly
        })}
        tabIndex={0}
        data-row={row}
        data-column={column}
      >
        {mode === "edit" ? (
          <DataEditor
            column={column}
            row={row}
            cell={cell}
            value={
              localValue !== EMPTY
                ? localValue
                : getValue({ row, column, cell })
            }
            onChange={this.handleChange}
          />
        ) : (
          <DataViewer
            column={column}
            row={row}
            cell={cell}
            getValue={getValue}
          />
        )}
      </td>
    );
  }
}

export default class CellProvider<CellType, Value> extends PureComponent<
  Props<CellType, Value>
> {
  mapResult = (child: *) => child;

  renderContext = ([data, active]: [CellType[][], Types.Active<Value>]) => {
    const {
      row,
      column,
      onChange,
      DataEditor,
      DataViewer,
      getValue
    } = this.props;
    const isActive = active && active.row === row && active.column === column;
    return (
      <Cell
        {...{ row, column, onChange, DataEditor, DataViewer, getValue }}
        cell={data[row][column]}
        mode={active && isActive ? active.mode : "view"}
        isActive={Boolean(
          active && active.row === row && active.column === column
        )}
      />
    );
  };

  render() {
    return (
      <Composer
        components={[<Contexts.Data.Consumer />, <Contexts.Active.Consumer />]}
        mapResult={this.mapResult}
      >
        {this.renderContext}
      </Composer>
    );
  }
}
