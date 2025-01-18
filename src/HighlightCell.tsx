import * as React from "react";
import classnames from "classnames";
import useSelector from "./use-selector";
import { getCellDimensions } from "./util";
import {Highlight} from "./highlight";

/**
 * A component that highlights a cell by taking a specific cell coordinate (`point`) and `color` value
 * Like ActiveCell, it captures the position and size (cell bounding) to display the highlight.
 */
type HighlightCellComponentProps ={
  highLight: Highlight;
}
const HighlightCell: React.FC<HighlightCellComponentProps> = ({ highLight }) => {
  const { point, color } = highLight;
  const rootRef = React.useRef<HTMLDivElement>(null);

  const dimensions = useSelector((state) =>
      getCellDimensions(point, state.rowDimensions, state.columnDimensions)
  );

  console.log(`HighlightCell: point:${JSON.stringify(point)} ${JSON.stringify(dimensions)}`);

  const hidden = !dimensions;
  if (hidden) {
    return null;
  }

  return (
      <div
          ref={rootRef}
          className={classnames(
              "Spreadsheet__highlight-cell"
          )}
          style={{
            ...dimensions,
            borderColor: color,
            borderWidth: 2,
            borderStyle: "solid",
            pointerEvents: "none",
          }}
          tabIndex={0}
      />
  );
};

const HighlightCellContainer: React.FC = () => {
  const highlights = useSelector((state) => state.highlights);

  return (
      <>
        {highlights.map((highlight, index) => (
            <HighlightCell key={index} highLight={highlight} />
        ))}
      </>
  );
}

export default HighlightCellContainer;
