// @flow

import { Component } from "react";
import type { Node } from "react";

export default class Throttle<F: Function, V> extends Component<
  {
    onChange: F,
    timeout: number,
    initialValue: V,
    children: ({ handleChange: Function, value: V }) => Node
  },
  { value: V | void }
> {
  state = { value: undefined };

  current = null;

  componentWillReceiveProps(nextProps) {
    if (this.props.initialValue !== nextProps.initialValue) {
      this.setState({ value: undefined });
    }
  }

  handleChange = (value: V) => {
    const { onChange, timeout } = this.props;
    this.setState({ value });
    if (this.current) {
      clearTimeout(this.current);
    }
    this.current = setTimeout(() => onChange(value), timeout);
  };

  render() {
    const { initialValue, children } = this.props;
    const { value } = this.state;
    return children({
      value: value === undefined ? initialValue : value,
      handleChange: this.handleChange
    });
  }
}
