/**
 * Example asynchronous cell data
 */

import * as React from "react";
import { CellBase, DataEditorProps } from "..";

type Value = number;
type Cell = CellBase<Value> & { value: Value };

const AsyncCellData = ({
  onChange,
  row,
  column,
  cell,
  getValue,
}: DataEditorProps<Cell, Value>) => {
  const [loading, setLoading] = React.useState(false);
  const handleClick = React.useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const nextValue = Math.floor(Math.random() * 100);
      onChange({ value: nextValue });
    }, 1000);
  }, [setLoading, onChange, row, column]);
  const value = getValue({ data: cell, row, column });
  return (
    <div>
      {value}
      {loading ? "Loading..." : <button onClick={handleClick}>Click Me</button>}
    </div>
  );
};

export default AsyncCellData;
