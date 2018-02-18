// @flow

import React, { Component } from "react";
import type { ComponentType, Node as ReactNode } from "react";
import { shallowEqual } from "./util";

type Props = {
  cell: {
    value: ReactNode,
    component?: ComponentType<Props>
  }
};

export default class DataViewer extends Component<Props> {
  shouldComponentUpdate(nextProps: Props) {
    if (nextProps.cell.component) {
      return !shallowEqual(this.props, nextProps);
    }
    return nextProps.cell.value !== this.props.cell.value;
  }

  render() {
    const { cell } = this.props;
    if (cell.component) {
      return <cell.component {...this.props} />;
    }
    return this.props.cell.value;
  }
}
