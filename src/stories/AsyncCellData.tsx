/**
 * Example asynchronous cell data
 */

import * as React from "react";
import { CellBase, DataEditorComponent } from "..";

type Cell = CellBase<number | undefined>;

const AsyncCellData: DataEditorComponent<Cell> = ({ onChange, cell }) => {
  const [loading, setLoading] = React.useState(false);
  const handleClick = React.useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const nextValue = Math.floor(Math.random() * 100);
      onChange({ value: nextValue });
    }, 1000);
  }, [setLoading, onChange]);
  const value = cell?.value;
  return (
    <div>
      {value}
      {loading ? "Loading..." : <button onClick={handleClick}>Click Me</button>}
    </div>
  );
};

export default AsyncCellData;
