import * as React from "react";
import * as PointSet from "./point-set";
import * as Types from "./types";
import classnames from "classnames";
import { getCellDimensions } from "./util";

export type StateProps = Types.Dimensions & {
  hidden: boolean;
  dragging: boolean;
};

export type Props = StateProps & {
  variant: "copied" | "selected";
};

const FloatingRect: React.FC<Props> = ({
  width,
  height,
  top,
  left,
  dragging,
  hidden,
  variant,
}) => (
  <div
    className={classnames("Spreadsheet__floating-rect", {
      [`Spreadsheet__floating-rect--${variant}`]: variant,
      "Spreadsheet__floating-rect--dragging": dragging,
      "Spreadsheet__floating-rect--hidden": hidden,
    })}
    style={{ width, height, top, left }}
  />
);

const getRangeDimensions = (
  points: PointSet.PointSet,
  state: Types.StoreState
): Types.Dimensions => {
  const { width, height, left, top } = PointSet.reduce(
    (acc, point) => {
      const inOnEdges = PointSet.onEdges(points, point);
      const dimensions = getCellDimensions(point, state);
      if (dimensions) {
        acc.width = inOnEdges.top ? acc.width + dimensions.width : acc.width;
        acc.height = inOnEdges.left
          ? acc.height + dimensions.height
          : acc.height;
        acc.left = inOnEdges.left && inOnEdges.top ? dimensions.left : acc.left;
        acc.top = inOnEdges.left && inOnEdges.top ? dimensions.top : acc.top;
      }
      return acc;
    },
    points,
    { left: 0, top: 0, width: 0, height: 0 }
  );
  return { left, top, width, height };
};

export const mapStateToProps = (
  state: Types.StoreState,
  cells: PointSet.PointSet
): Omit<StateProps, "dragging"> => ({
  ...getRangeDimensions(cells, state),
  hidden: PointSet.isEmpty(cells),
});

export default FloatingRect;
