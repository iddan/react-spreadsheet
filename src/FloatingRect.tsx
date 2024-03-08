import * as React from "react";
import classnames from "classnames";
import * as Types from "./types";

export type Props = {
  variant?: string;
  dimensions?: Types.Dimensions | null | undefined;
  hidden?: boolean;
  dragging?: boolean;
  additionalClasses?: string[],
};

const FloatingRect: React.FC<Props> = ({
  dimensions,
  dragging,
  hidden,
  variant,
  additionalClasses,
}) => {
  const { width, height, top, left } = dimensions || {};
  return (
    <div
      className={classnames("Spreadsheet__floating-rect", additionalClasses, {
        [`Spreadsheet__floating-rect--${variant}`]: variant,
        "Spreadsheet__floating-rect--dragging": dragging,
        "Spreadsheet__floating-rect--hidden": hidden,
      })}
      style={{ width, height, top, left }}
    />
  );
};

export default FloatingRect;
