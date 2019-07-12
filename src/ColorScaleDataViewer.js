// @flow

import React from "react";
import DataViewer from "./DataViewer";
import type { Props as DataViewerProps } from "./DataViewer";
import { connect } from "unistore/react";

type ColorScalePoint =
  | { color: string, type: "number", value: number }
  | { color: string, type: "percent", value: number }
  | { color: string, type: "percentile", value: number };

type Props = DataViewerProps & {
  columnMaxValue: ColorScalePoint | { type: "minimum", color: string },
  columnMinValue: ColorScalePoint | { type: "maximum", color: string },
  maxPoint: {}
};

const ColorScaleDataViewer = (props: Props) => {
  console.log(props.cell.value, props.columnMaxValue, props.columnMinValue);
  return <DataViewer {...props} />;
};

const mapStateToProps = (state, props) => {
  let columnMaxValue: number = 0;
  let columnMinValue: number = 0;
  for (const row of state.data) {
    const cell = row[props.column];
    columnMaxValue = Math.max(cell.value, columnMaxValue);
    columnMinValue = Math.min(cell.value, columnMinValue);
  }
  return { columnMaxValue, columnMinValue };
};

export default connect(mapStateToProps)(ColorScaleDataViewer);
