/* @flow */
import React, { PureComponent } from "react";
import type { ComponentType } from "react";
import classnames from "classnames";
import scrollIntoViewIfNeeded from "scroll-into-view-if-needed";
import CellCreator from "./CellCreator";
import DataViewer from "./DataViewer";
import DataEditor from "./DataEditor";
import { normalizeIndex, getCellFromPath } from "./util";
import "./Spreadsheet.css";

type Value = string | number;

type CellComponentProps<Cell> = {
  cell: Cell,
  row: number,
  column: number,
  value: string | number
};

type Props<Cell> = {
  DataViewer: ComponentType<CellComponentProps<Cell>>,
  DataEditor: ComponentType<CellComponentProps<Cell>>,
  data: Cell[][],
  getValue: (cell: Cell) => Value,
  onChange: ({ cell: Cell, row: number, column: number }) => void
};

type Active = {
  row: number,
  column: number
};

type Creator = {
  top: number,
  left: number
};

type State = {
  active: ?Active,
  creator: ?Creator
};

/**
 * @todo
 * Selection: drag select
 * Clipboard: copy, paste, select copy, select paste
 * Support getValue() return boolean by default
 */
export default class Spreadsheet<Cell> extends PureComponent<
  Props<Cell>,
  State
> {
  static defaultProps = {
    DataViewer,
    DataEditor,
    getValue: (cell: Cell) => cell.value
  };

  root: ?HTMLDivElement;

  state = {
    active: null,
    creator: null
  };

  normalizeActive(active: ?Active) {
    if (!active) {
      return null;
    }
    const { data } = this.props;
    const [firstRow] = data;
    return {
      ...active,
      row: normalizeIndex(data, active.row),
      column: normalizeIndex(firstRow, active.column)
    };
  }

  setActive(arg1: ?Active | ((prevActive: ?Active) => ?Active)) {
    this.setState(prevState => {
      switch (typeof arg1) {
        case "object": {
          return {
            active: {
              ...prevState.active,
              ...this.normalizeActive(arg1)
            },
            creator: null
          };
        }
        case "function": {
          const nextActive = arg1(prevState.active);
          return {
            active: {
              ...prevState.active,
              ...this.normalizeActive(nextActive)
            },
            creator: null
          };
        }
        default: {
          throw new Error(
            "this.setActive() must recieve active state object or function returning next active state"
          );
        }
      }
    });
  }

  setCreator(row: number, column: number, left: number, top: number, value) {
    const cell = this.props.data[row][column];
    if (cell && cell.readOnly) {
      return;
    }
    this.setState({
      active: { row, column },
      creator: { left, top, value }
    });
  }

  unsetCreator() {
    this.setState({ creator: null });
  }

  /**
   * Start edit by keyboard
   */
  handleKeyPress = (e: SyntheticEvent<*>) => {
    const cell = getCellFromPath(e.nativeEvent);
    if (cell) {
      this.setCreator(
        cell.row,
        cell.column,
        cell.element.offsetLeft,
        cell.element.offsetTop
      );
    }
  };

  keyDownHandlers = {
    ArrowUp: () => {
      this.setActive(
        active =>
          active && {
            row: active.row - 1,
            column: active.column
          }
      );
    },
    ArrowDown: () => {
      this.setActive(
        active =>
          active && {
            row: active.row + 1,
            column: active.column
          }
      );
    },
    ArrowLeft: () => {
      this.setActive(
        active =>
          active && {
            row: active.row,
            column: active.column - 1
          }
      );
    },
    ArrowRight: () => {
      this.setActive(
        active =>
          active && {
            row: active.row,
            column: active.column + 1
          }
      );
    },
    Tab: () => {
      this.setActive(
        active =>
          active && {
            row: active.row,
            column: active.column + 1
          }
      );
    },
    Enter: (e: SyntheticEvent<*>) => {
      const cell = getCellFromPath(e.nativeEvent);
      if (cell) {
        this.setCreator(
          cell.row,
          cell.column,
          cell.element.offsetLeft,
          cell.element.offsetTop
        );
      }
    },
    Backspace: (e: SyntheticEvent<*>) => {
      const cell = getCellFromPath(e.nativeEvent);
      if (cell) {
        this.setCreator(
          cell.row,
          cell.column,
          cell.element.offsetLeft,
          cell.element.offsetTop,
          ""
        );
      }
    }
  };

  creatorKeyDownHandlers = {
    Escape: () => {
      this.unsetCreator();
    },
    Tab: () => {
      this.setActive(
        active =>
          active && {
            row: active.row,
            column: active.column + 1
          }
      );
    },
    Enter: () => {
      this.setActive(
        active =>
          active && {
            row: active.row + 1,
            column: active.column
          }
      );
    }
  };

  /**
   * Keyboard navigation
   */
  handleKeyDown = (e: KeyboardEvent) => {
    const { active, creator } = this.state;
    if (active === null) {
      return;
    }
    const handlers = creator
      ? this.creatorKeyDownHandlers
      : this.keyDownHandlers;
    const handler = handlers[e.key];
    if (handler) {
      e.preventDefault();
      handler(e);
    }
  };

  /**
   * Set active on click
   */
  handleClick = (e: SyntheticEvent<*>) => {
    const cell = getCellFromPath(e.nativeEvent);
    if (cell) {
      this.setActive({ row: cell.row, column: cell.column });
    }
  };

  handleDoubleClick = (e: SyntheticEvent<*>) => {
    const cell = getCellFromPath(e.nativeEvent);
    if (cell) {
      this.setCreator(
        cell.row,
        cell.column,
        cell.element.offsetLeft,
        cell.element.offsetTop
      );
    }
  };

  handleRoot = (root: ?HTMLDivElement) => {
    this.root = root;
  };

  handleActiveCell = () => {
    const { creator, active } = this.state;
    if (!this.root) {
      return;
    }
    const activeCell = this.root.querySelector("td.active");
    if (creator === null && active && activeCell !== null) {
      activeCell.focus();
      scrollIntoViewIfNeeded(activeCell, { centerIfNeeded: true });
    }
  };

  handleActiveCellTimeout: ?TimeoutID = null;

  componentDidUpdate() {
    if (this.handleActiveCellTimeout) {
      clearTimeout(this.handleActiveCellTimeout);
    }
    this.handleActiveCellTimeout = setTimeout(this.handleActiveCell, 30);
  }

  render() {
    const { DataViewer, DataEditor, data, getValue } = this.props;
    const { active, creator } = this.state;
    const activeCell = active && data[active.row][active.column];
    return (
      <div
        ref={this.handleRoot}
        className="Spreadsheet"
        onClick={this.handleClick}
        onDoubleClick={this.handleDoubleClick}
        onKeyPress={this.handleKeyPress}
        onKeyDown={this.handleKeyDown}
      >
        <table>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => {
                  const isActive =
                    active && active.row === i && active.column === j;
                  return (
                    <td
                      key={j}
                      className={classnames({
                        active: isActive,
                        readonly: cell.readOnly
                      })}
                      tabIndex={0}
                      data-row={i}
                      data-column={j}
                    >
                      <DataViewer
                        cell={cell}
                        row={i}
                        column={j}
                        active={isActive}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {active &&
          creator && (
            <CellCreator
              row={active.row}
              column={active.column}
              top={creator.top}
              left={creator.left}
              cell={activeCell}
              value={
                creator.value !== undefined
                  ? creator.value
                  : getValue(activeCell)
              }
              onChange={this.props.onChange}
              DataEditor={DataEditor}
            />
          )}
      </div>
    );
  }
}
