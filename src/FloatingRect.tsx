import * as React from "react";
import classnames from "classnames";
import * as Types from "./types";

export type Props = {
  variant?: string;
  dimensions?: Types.Dimensions | null | undefined;
  hidden?: boolean;
  dragging?: boolean;
  autoFilling?: boolean;
  className?: string;
  children?: React.ReactNode;
};

const FloatingRect: React.FC<Props> = ({
  dimensions,
  dragging,
  autoFilling,
  hidden,
  variant,
  className,
  children,
}) => {
  const { width, height, top, left } = dimensions || {};
  return (
    <div
      className={classnames(
        "Spreadsheet__floating-rect",
        {
          [`Spreadsheet__floating-rect--${variant}`]: variant,
          "Spreadsheet__floating-rect--dragging": dragging,
          "Spreadsheet__floating-rect--auto-filling": autoFilling,
          "Spreadsheet__floating-rect--hidden": hidden,
        },
        className
      )}
      style={{ width, height, top, left }}
    >
      {children}
    </div>
  );
};

export default FloatingRect;
