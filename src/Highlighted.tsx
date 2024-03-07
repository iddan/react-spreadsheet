import * as React from "react";
import {getRangeDimensions} from "./util";
import FloatingRect from "./FloatingRect";
import useSelector from "./use-selector";
import * as Types from "./types";
import {Highlight} from "./types";

export function getHighlightedDimensions(
    rowDimensions: Types.StoreState["rowDimensions"],
    columnDimensions: Types.StoreState["columnDimensions"],
    data: Types.StoreState["model"]["data"],
    highlight: Highlight
): Types.Dimensions | undefined {
  const range = highlight.selection.toRange(data);
  return range
      ? getRangeDimensions(rowDimensions, columnDimensions, range)
      : undefined;
}

const HighlightRect: React.FC<{ highlight: Highlight }> = ({ highlight }) => {
    const dimensions = useSelector(
        (state) =>
            highlight &&
            getHighlightedDimensions(
                state.rowDimensions,
                state.columnDimensions,
                state.model.data,
                highlight
            )
    );

    const dragging = useSelector((state) => state.dragging);
    return (
        <FloatingRect
            variant="highlighted"
            additionalClasses={highlight.classNames}
            dimensions={dimensions}
            dragging={dragging}
            hidden={false}
        />
    );
}

const Highlighted: React.FC = () => {
  const highlights= useSelector((state) => state.highlights);

  return (
    <>
      {highlights.map((highlight, index) => {
        return <HighlightRect key={index} highlight={highlight} />;
      })}
    </>
  );
};

export default Highlighted;
