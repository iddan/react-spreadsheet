import React, { Fragment, useState, useCallback } from "react";

import { createFixture } from "react-cosmos";
import Spreadsheet, {
  createEmptyMatrix
} from "../src/SpreadsheetStateProvider";
import * as Matrix from "../src/matrix";
import { INITIAL_ROWS, INITIAL_COLUMNS } from "./Basic";
import "./index.css";

const initialData = createEmptyMatrix(INITIAL_ROWS, INITIAL_COLUMNS);

const Controlled = () => {
  const [data, setData] = useState(initialData);

  const addColumn = useCallback(
    () =>
      setData(data =>
        data.map(row => {
          const nextRow = [...row];
          nextRow.length += 1;
          return nextRow;
        })
      ),
    [setData]
  );

  const removeColumn = useCallback(() => {
    setData(data =>
      data.map(row => {
        return row.slice(0, row.length - 1);
      })
    );
  }, [setData]);

  const addRow = useCallback(
    () =>
      setData(data => {
        const { columns } = Matrix.getSize(data);
        return [...data, Array(columns)];
      }),
    [setData]
  );

  const removeRow = useCallback(() => {
    setData(data => {
      return data.slice(0, data.length - 1);
    });
  }, [setData]);

  return (
    <Fragment>
      <div>
        <button onClick={addColumn}>Add column</button>
        <button onClick={addRow}>Add row</button>
        <button onClick={removeColumn}>Remove column</button>
        <button onClick={removeRow}>Remove row</button>
      </div>
      <Spreadsheet data={data} onChange={setData} />
    </Fragment>
  );
};

Controlled.displayName = "Spreadsheet";

export default createFixture({
  component: Controlled,
  name: "Controlled",
  props: {
    data: initialData
  }
});
