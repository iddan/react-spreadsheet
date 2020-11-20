import * as React from "react";
import { Spreadsheet, createEmptyMatrix, Matrix } from "..";
import { INITIAL_ROWS, INITIAL_COLUMNS } from "./shared";
import "./index.css";

const INITIAL_DATA = createEmptyMatrix(INITIAL_ROWS, INITIAL_COLUMNS);

type Data = Matrix<{ value: string }>;

/**
 * Removes cells not matching the filter from matrix while maintaining the
 * minimum size that includes all of the matching cells.
 */
function filterMatrix(matrix: Data, filter: string): Data {
  const filtered = [];
  if (matrix.length === 0) {
    return matrix;
  }
  for (let row = 0; row < matrix.length; row++) {
    if (matrix.length !== 0) {
      for (let column = 0; column < matrix[0].length; column++) {
        const cell = matrix[row][column];
        if (cell && cell.value.includes(filter)) {
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
}

export const Filter = () => {
  const [data, setData] = React.useState(INITIAL_DATA);
  const [filter, setFilter] = React.useState("");

  const handleFilterChange = React.useCallback(
    (event) => {
      const nextFilter = event.target.value;
      setFilter(nextFilter);
    },
    [setFilter]
  );

  const filtered = React.useMemo(() => {
    return filterMatrix(data, filter);
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
      <Spreadsheet data={filtered} onChange={setData} />
    </>
  );
};
