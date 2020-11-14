
import * as React from "react";
import * as PointSet from "./point-set";
import * as Types from "./types";
import classnames from "classnames";
import { getCellDimensions } from "./util";

type Props = {
  className: string,
  dragging: boolean | null,
  hidden: boolean,
  variant: "copied" | "selected"
} & Types.Dimensions;

const FloatingRect = (
  {
    width,
    height,
    top,
    left,
    className,
    dragging,
    hidden,
    variant
  }: Props
): React.ReactNode => <div
  className={classnames("Spreadsheet__floating-rect", {
    [`Spreadsheet__floating-rect--${variant}`]: variant,
    "Spreadsheet__floating-rect--dragging": dragging,
    "Spreadsheet__floating-rect--hidden": hidden,
  })}
  style={{ width, height, top, left }}
/>;

const getRangeDimensions = (points: PointSet.PointSet, state: Types.StoreState<unknown>): Types.Dimensions => {
  const { width, height, left, top } = PointSet.reduce(
    (acc, point) => {
      const isOnEdge = PointSet.onEdge(points, point);
      const dimensions = getCellDimensions(point, state);
      if (dimensions) {
        acc.width = isOnEdge.top ? acc.width + dimensions.width : acc.width;
        acc.height = isOnEdge.left
          ? acc.height + dimensions.height
          : acc.height;
        acc.left = isOnEdge.left && isOnEdge.top ? dimensions.left : acc.left;
        acc.top = isOnEdge.left && isOnEdge.top ? dimensions.top : acc.top;
      }
      return acc;
    },
    points,
    { left: 0, top: 0, width: 0, height: 0 }
  );
  return { left, top, width, height };
};

type StateToProps = ((state: Types.StoreState<unknown>) => $Shape<Props>);

export const mapStateToProps = (cells: PointSet.PointSet): StateToProps => (state: Types.StoreState<unknown>): $Shape<Props> => {
  return {
    ...getRangeDimensions(cells, state),
    hidden: PointSet.size(cells) === 0,
  };
};

export default FloatingRect;
