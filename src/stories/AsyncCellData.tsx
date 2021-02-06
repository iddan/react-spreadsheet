/**
 * Example asynchronous cell data
 */

import * as React from "react";
import { DataEditorComponent, DataViewerComponent } from "..";

export const AsyncCellDataViewer: DataViewerComponent = ({ cell }) => {
  const value = cell?.value;
  return (
    <div>
      {value}
      <button disabled>Click Me</button>
    </div>
  );
};

export const AsyncCellDataEditor: DataEditorComponent = ({
  onChange,
  cell,
}) => {
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
