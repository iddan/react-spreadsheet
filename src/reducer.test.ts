import * as React from "react";
import { hasKeyDownHandler } from "./reducer";

describe("hasKeyDownHandler", () => {
  const cases = [
    ["returns true for handled key", "Enter", true],
    ["returns false for handled key", "1", false],
  ] as const;
  test.each(cases)("%s", (name, key, expected) => {
    expect(hasKeyDownHandler({ key } as React.KeyboardEvent)).toBe(expected);
  });
});
