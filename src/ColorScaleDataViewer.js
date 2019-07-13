// @flow

import React from "react";
import { connect } from "unistore/react";
import gradstop from "gradstop";
import DataViewer from "./DataViewer";
import type { Props as DataViewerProps } from "./DataViewer";

type ColorScalePoint =
  | { color: string, type: "number", value: number }
  | { color: string, type: "percent", value: number }
  | { color: string, type: "percentile", value: number };

type MinPoint = ColorScalePoint | { type: "minimum", color: string };
type MidPoint = ColorScalePoint | null;
type MaxPoint = ColorScalePoint | { type: "maximum", color: string };

type Props = DataViewerProps & {
  columnMaxValue: number,
  columnMinValue: number,
  columnSize: number,
  minPoint: MinPoint,
  midPoint: MidPoint,
  maxPoint: MaxPoint
};

const resolveColor = (props: Props): ?string => {
  const {
    columnMaxValue,
    columnMinValue,
    minPoint,
    midPoint,
    maxPoint,
    columnSize,
    cell
  } = props;
  if (!cell || !cell.value) {
    return null;
  }
  const { value } = cell;
  /** @todo handle midPoint  */
  const gradient = gradstop({
    stops: columnSize,
    inputFormat: "hex",
    colorArray: midPoint
      ? [minPoint.color, midPoint.color, maxPoint.color]
      : [minPoint.color, maxPoint.color]
  });
  const relativeValue =
    (value - columnMinValue) / (columnMaxValue - columnMinValue);
  const index = Math.floor(relativeValue * (columnSize - 1));
  return gradient[index];
};

const ColorScaleDataViewer = (props: Props) => {
  const color = resolveColor(props);
  return (
    <div style={{ backgroundColor: color }}>
      <DataViewer {...props} />
    </div>
  );
};

const mapStateToProps = (state, props) => {
  let columnMaxValue: number;
  let columnMinValue: number;
  for (const row of state.data) {
    const cell = row[props.column];
    const value = cell && cell.value;
    if (!value) {
      continue;
    }
    columnMaxValue = columnMaxValue ? Math.max(value, columnMaxValue) : value;
    columnMinValue = columnMinValue ? Math.min(value, columnMinValue) : value;
  }
  return { columnMaxValue, columnMinValue, columnSize: state.data.length };
};

const createColorScaleDataViewer = ({
  minPoint,
  maxPoint,
  midPoint = null
}: {
  minPoint: MinPoint,
  maxPoint: MaxPoint,
  midPoint: MidPoint
}) => {
  const BoundScaleDataViewer = props => {
    return (
      <ColorScaleDataViewer
        {...props}
        minPoint={minPoint}
        midPoint={midPoint}
        maxPoint={maxPoint}
      />
    );
  };
  return connect(mapStateToProps)(BoundScaleDataViewer);
};

export default createColorScaleDataViewer;
