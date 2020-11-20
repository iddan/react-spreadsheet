import * as React from "react";
import { Meta } from "@storybook/react/types-6-0";
import { createEmptyMatrix, Spreadsheet } from "..";
import * as Matrix from "../matrix";
import { EMPTY_DATA, INITIAL_COLUMNS, INITIAL_ROWS } from "./shared";
import AsyncCellData from "./AsyncCellData";
import CustomCell from "./CustomCell";
import { RangeEdit, RangeView } from "./RangeDataComponents";
import { SelectEdit, SelectView } from "./SelectDataComponents";
import { CustomCornerIndicator } from "./CustomCornerIndicator";

export default {
  title: "Spreadsheet",
  component: Spreadsheet,
} as Meta;

export const Basic = () => <Spreadsheet data={EMPTY_DATA} />;

export const Controlled = () => {
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

  return (
    <>
      <div>
        <button onClick={addColumn}>Add column</button>
        <button onClick={addRow}>Add row</button>
        <button onClick={removeColumn}>Remove column</button>
        <button onClick={removeRow}>Remove row</button>
      </div>
      <Spreadsheet data={data} onChange={setData} />
    </>
  );
};

export const CustomRowLabels = () => (
  <Spreadsheet
    data={EMPTY_DATA}
    rowLabels={["Dan", "Alice", "Bob", "Steve", "Adam", "Ruth"]}
  />
);

export const CustomColumnLabels = () => (
  <Spreadsheet
    data={EMPTY_DATA}
    columnLabels={["Name", "Age", "Email", "Address"]}
  />
);

export const HideIndicators = () => (
  <Spreadsheet data={EMPTY_DATA} hideColumnIndicators hideRowIndicators />
);

export const KeyDown = () => (
  <Spreadsheet
    data={EMPTY_DATA}
    onKeyDown={(event) => {
      if (event.altKey) {
        event.preventDefault();
      }
    }}
  />
);

export const Readonly = () => {
  const data = createEmptyMatrix(INITIAL_ROWS, INITIAL_COLUMNS);
  data[0][0] = { readOnly: true, value: "Read Only" };
  return <Spreadsheet data={data} />;
};

export const WithAsyncCellData = () => {
  const data = createEmptyMatrix(INITIAL_ROWS, INITIAL_COLUMNS);

  data[2][2] = {
    value: 1,
    DataViewer: AsyncCellData,
    DataEditor: AsyncCellData,
  };
  return (
    <Spreadsheet
      data={data}
      onCellCommit={(...args: unknown[]) =>
        console.log("onCellCommit", ...args)
      }
      onChange={(...args: unknown[]) => console.log("onChange", ...args)}
    />
  );
};

export const WithCustomCell = () => (
  <Spreadsheet data={EMPTY_DATA} Cell={CustomCell} />
);

export const RangeCell = () => {
  const data = createEmptyMatrix(INITIAL_ROWS, INITIAL_COLUMNS);
  data[2][2] = {
    value: 0,
    DataViewer: RangeView,
    DataEditor: RangeEdit,
  };
  return <Spreadsheet data={data} />;
};

export const SelectCell = () => {
  const data = createEmptyMatrix(INITIAL_ROWS, INITIAL_COLUMNS);

  data[2][2] = {
    value: 0,
    DataViewer: SelectView,
    DataEditor: SelectEdit,
  };

  return <Spreadsheet data={data} />;
};

export const WithCornerIndicator = () => (
  <Spreadsheet data={EMPTY_DATA} CornerIndicator={CustomCornerIndicator} />
);
