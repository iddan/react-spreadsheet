import React, { Component } from "react";
import { createFixture } from "react-cosmos";
import classnames from "classnames";
import Spreadsheet, {
  createEmptyMatrix
} from "../src/SpreadsheetStateProvider";
import { INITIAL_ROWS, INITIAL_COLUMNS } from "./Basic";
import "./index.css";

const initialData = createEmptyMatrix(INITIAL_ROWS, INITIAL_COLUMNS);

Spreadsheet.displayName = "Spreadsheet";

class Cell extends Component {
  root = React.createRef();

  componentDidMount() {
    const { column, row, setCellDimensions } = this.props;

    const height = 30;
    const width = 96;
    setCellDimensions({ row, column }, {
      height,
      width,
      left: width * (column + 1),
      top: height * (row + 1)
    });
  }

  componentDidUpdate() {
    const { active, mode } = this.props;

    if (this.root.current && active && mode === "view") {
      this.root.current.focus();
    }
  }

  handleMouseDown = (e) => {
    const {
      row,
      column,
      select,
      activate,
      mode
    } = this.props;
    if (mode === "view") {
      if (e.shiftKey) {
        select({ row, column });
        return;
      }

      activate({ row, column });
    }
  };

  handleMouseOver = (e) => {
    const { row, column, dragging, select } = this.props;
    if (dragging) {
      select({ row, column });
    }
  };

  render() {
    const { active, row, column, getValue, formulaParser } = this.props;
    let { DataViewer, data } = this.props;
    if (data && data.DataViewer) {
      ({ DataViewer, ...data } = data);
    }

    return (
      <td
        ref={this.root}
        className={classnames(
          { readonly: data && data.readOnly },
          data && data.className
        )}
        style={{
          borderColor: !active && 'black',
        }}
        tabIndex={0}

        onMouseOver={this.handleMouseOver}
        onMouseDown={this.handleMouseDown}
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

export default createFixture({
  component: Spreadsheet,
  name: "CustomCellContainer",
  props: {
    data: initialData,
    Cell
  }
});
