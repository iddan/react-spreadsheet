/**
 * Example asynchronous cell data
 */

import * as React from "react";

const AsyncCellData = ({ onChange, row, column, cell, getValue }) => {
  const [loading, setLoading] = React.useState(false);
  const handleClick = React.useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const nextValue = Math.floor(Math.random() * 100);
      onChange({ row, column, value: nextValue });
    }, 1000);
  }, [setLoading, onChange, row, column]);
  const value = getValue({ data: cell });
  return (
    <div>
      {value}
      {loading ? "Loading..." : <button onClick={handleClick}>Click Me</button>}
    </div>
  );
};

export default AsyncCellData;
