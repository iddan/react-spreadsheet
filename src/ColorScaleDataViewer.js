// @flow

import React from "react";
import { connect } from "unistore/react";
import tinygradient from "tinygradient";
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

  const colors = midPoint
    ? [
        { color: minPoint.color, pos: 0 },
        { color: midPoint.color, pos: midPoint.value },
        { color: maxPoint.color, pos: 1 }
      ]
    : [{ color: minPoint.color, pos: 0 }, { color: maxPoint.color, pos: 1 }];

  const gradient = tinygradient(colors);
  const relativeValue =
    (value - columnMinValue) / (columnMaxValue - columnMinValue);
  return gradient.rgbAt(relativeValue);
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
  midPoint
}: {
  minPoint: MinPoint,
  maxPoint: MaxPoint,
  midPoint?: MidPoint
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
