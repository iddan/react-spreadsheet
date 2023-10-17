import * as React from "react";
import type { StoryFn, Meta, StoryObj } from "@storybook/react";
import {
  createEmptyMatrix,
  Spreadsheet,
  Props,
  CellBase,
  EntireWorksheetSelection,
  Selection,
  EntireRowsSelection,
  EntireColumnsSelection,
  EmptySelection,
} from "..";
import * as Matrix from "../matrix";
import { AsyncCellDataEditor, AsyncCellDataViewer } from "./AsyncCellData";
import CustomCell from "./CustomCell";
import { RangeEdit, RangeView } from "./RangeDataComponents";
import { SelectEdit, SelectView } from "./SelectDataComponents";
import { CustomCornerIndicator } from "./CustomCornerIndicator";

type StringCell = CellBase<string | undefined>;
type NumberCell = CellBase<number | undefined>;

const INITIAL_ROWS = 6;
const INITIAL_COLUMNS = 4;
const EMPTY_DATA = createEmptyMatrix<StringCell>(INITIAL_ROWS, INITIAL_COLUMNS);

const meta: Meta<Props<StringCell>> = {
  title: "Spreadsheet",
  component: Spreadsheet,
  parameters: {
    controls: {
      expanded: true,
      exclude:
        /ColumnIndicator|CornerIndicator|RowIndicator|Cell|HeaderRow|DataViewer|DataEditor|Row|Table/,
    },
  },
  args: {
    data: EMPTY_DATA,
  },
  argTypes: {
    columnLabels: {
      control: "array",
      defaultValue: [],
    },
    rowLabels: {
      control: "array",
      defaultValue: [],
    },
  },
  decorators: [
    (Story): React.ReactElement => (
      <div
        onKeyDown={(e) => {
          if (
            (e.target instanceof HTMLElement &&
              e.target.classList.contains("Spreadsheet__active-cell")) ||
            e.target instanceof HTMLInputElement
          ) {
            e.stopPropagation();
          }
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export default meta;

export const Basic: StoryObj = {
  args: {},
};

export const DarkMode: StoryObj = {
  args: {
    ...meta.args,
    darkMode: true,
  },
};

export const Controlled: StoryFn<Props<StringCell>> = (props) => {
  const [data, setData] = React.useState(EMPTY_DATA);

  const addColumn = React.useCallback(
    () =>
      setData((data) =>
        data.map((row) => {
          const nextRow = [...row];
          nextRow.length += 1;
          return nextRow;
        })
      ),
    [setData]
  );

  const removeColumn = React.useCallback(() => {
    setData((data) =>
      data.map((row) => {
        return row.slice(0, row.length - 1);
      })
    );
  }, [setData]);

  const addRow = React.useCallback(
    () =>
      setData((data) => {
        const { columns } = Matrix.getSize(data);
        return [...data, Array(columns)];
      }),
    [setData]
  );

  const removeRow = React.useCallback(() => {
    setData((data) => {
      return data.slice(0, data.length - 1);
    });
  }, [setData]);

  const actionPressed = React.useCallback((action) => {
    console.log("this action", action);
    const { actionPressed, rowNumber } = action;
    if (actionPressed === "addAbove") {
      setData((data) => {
        const { columns } = Matrix.getSize(data);
        console.log("Columns", columns);
        const newRow = Array(columns);
        let newTable = JSON.parse(JSON.stringify(data)); // Deep copy
        newTable.splice(rowNumber, 0, newRow);
        return [...newTable];
      });
    } else if (actionPressed === "addBelow") {
      setData((data) => {
        const { columns } = Matrix.getSize(data);
        console.log("Columns", columns);
        const newRow = Array(columns);
        let newTable = JSON.parse(JSON.stringify(data)); // Deep copy
        newTable.splice(rowNumber + 1, 0, newRow);
        return [...newTable];
      });
    } else if (actionPressed === "delete") {
      setData((data) => {
        let newTable = JSON.parse(JSON.stringify(data)); // Deep copy
        newTable.splice(rowNumber, 1);
        return [...newTable];
      });
    }
  }, []);
  const isActive = React.useCallback((data) => {
    // console.log("this action",data)
  }, []);

  return (
    <>
      <div>
        <button onClick={addColumn}>Add column</button>
        <button onClick={addRow}>Add row</button>
        <button onClick={removeColumn}>Remove column</button>
        <button onClick={removeRow}>Remove row</button>
      </div>
      <Spreadsheet
        {...props}
        data={data}
        onChange={setData}
        isActionButtonEnable={true}
        onActionButtonClicked={actionPressed}
        onActivate={isActive}
        hideColumnIndicators={false}
      />
    </>
  );
};

export const CustomRowLabels: StoryObj = {
  args: {
    ...meta.args,
    rowLabels: ["Dan", "Alice", "Bob", "Steve", "Adam", "Ruth"],
  },
};

export const CustomColumnLabels: StoryObj = {
  args: {
    ...meta.args,
    columnLabels: ["Name", "Age", "Email", "Address"],
  },
};

export const HideIndicators: StoryObj = {
  args: {
    ...meta.args,
    hideColumnIndicators: true,
    hideRowIndicators: true,
  },
};

export const Readonly: StoryObj = {
  args: {
    ...meta.args,
    data: Matrix.set(
      { row: 0, column: 0 },
      { readOnly: true, value: "Read Only" },
      createEmptyMatrix<StringCell>(INITIAL_ROWS, INITIAL_COLUMNS)
    ),
  },
};

export const WithAsyncCellData: StoryObj = {
  args: {
    ...meta.args,
    data: Matrix.set(
      { row: 2, column: 2 },
      {
        value: undefined,
        DataViewer: AsyncCellDataViewer,
        DataEditor: AsyncCellDataEditor,
      },
      createEmptyMatrix<StringCell>(INITIAL_ROWS, INITIAL_COLUMNS)
    ),
  },
};

export const WithCustomCell: StoryObj = {
  args: {
    Cell: CustomCell,
  },
};

export const RangeCell: StoryObj = {
  args: {
    data: Matrix.set(
      { row: 2, column: 2 },
      {
        value: 0,
        DataViewer: RangeView,
        DataEditor: RangeEdit,
      },
      createEmptyMatrix<NumberCell>(INITIAL_ROWS, INITIAL_COLUMNS)
    ),
  },
};

export const WithSelectCell: StoryObj = {
  args: {
    ...meta.args,
    data: Matrix.set(
      { row: 2, column: 2 },
      {
        value: undefined,
        DataViewer: SelectView,
        DataEditor: SelectEdit,
        className: "select-cell",
      },
      createEmptyMatrix<StringCell>(INITIAL_ROWS, INITIAL_COLUMNS)
    ),
  },
};

export const WithCornerIndicator: StoryObj = {
  args: {
    ...meta.args,
    CornerIndicator: CustomCornerIndicator,
  },
};

export const Filter: StoryFn<Props<StringCell>> = (props) => {
  const [data, setData] = React.useState(
    EMPTY_DATA as Matrix.Matrix<StringCell>
  );
  const [filter, setFilter] = React.useState("");

  const handleFilterChange = React.useCallback(
    (event) => {
      const nextFilter = event.target.value;
      setFilter(nextFilter);
    },
    [setFilter]
  );

  /**
   * Removes cells not matching the filter from matrix while maintaining the
   * minimum size that includes all of the matching cells.
   */
  const filtered = React.useMemo(() => {
    if (filter.length === 0) {
      return data;
    }
    const filtered: Matrix.Matrix<StringCell> = [];
    for (let row = 0; row < data.length; row++) {
      if (data.length !== 0) {
        for (let column = 0; column < data[0].length; column++) {
          const cell = data[row][column];
          if (cell && cell.value && cell.value.includes(filter)) {
            if (!filtered[0]) {
              filtered[0] = [];
            }
            if (filtered[0].length < column) {
              filtered[0].length = column + 1;
            }
            if (!filtered[row]) {
              filtered[row] = [];
            }
            filtered[row][column] = cell;
          }
        }
      }
    }
    return filtered;
  }, [data, filter]);

  return (
    <>
      <div>
        <input
          type="text"
          placeholder="Filter"
          value={filter}
          onChange={handleFilterChange}
        />
      </div>
      <Spreadsheet {...props} data={filtered} onChange={setData} />
    </>
  );
};

export const ControlledSelection: StoryFn<Props<StringCell>> = (props) => {
  const [selected, setSelected] = React.useState<Selection>(
    new EmptySelection()
  );
  const handleSelect = React.useCallback((selection: Selection) => {
    setSelected(selection);
  }, []);

  const handleSelectEntireRow = React.useCallback(() => {
    setSelected(new EntireRowsSelection(0, 0));
  }, []);

  const handleSelectEntireColumn = React.useCallback(() => {
    setSelected(new EntireColumnsSelection(0, 0));
  }, []);

  const handleSelectEntireWorksheet = React.useCallback(() => {
    setSelected(new EntireWorksheetSelection());
  }, []);

  return (
    <div>
      <div>
        <button onClick={handleSelectEntireRow}>Select entire row</button>
        <button onClick={handleSelectEntireColumn}>Select entire column</button>
        <button onClick={handleSelectEntireWorksheet}>
          Select entire worksheet
        </button>
      </div>
      <Spreadsheet {...props} selected={selected} onSelect={handleSelect} />;
    </div>
  );
};
