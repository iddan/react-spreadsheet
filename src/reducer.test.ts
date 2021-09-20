import * as React from "react";
import * as Types from "./types";
import { INITIAL_STATE, hasKeyDownHandler } from "./reducer";

const EDIT_STATE: Types.StoreState = { ...INITIAL_STATE, mode: "edit" };

describe("hasKeyDownHandler", () => {
  const cases = [
    ["returns true for handled key", INITIAL_STATE, "Enter", true],
    ["returns false for handled key", INITIAL_STATE, "1", false],
    ["returns false for unhandled key in edit", EDIT_STATE, "Backspace", false],
    [
      "returns true for handled key in view unhandled in edit",
      INITIAL_STATE,
      "Backspace",
      true,
    ],
  ] as const;
  test.each(cases)("%s", (name, state, key, expected) => {
    expect(hasKeyDownHandler(state, { key } as React.KeyboardEvent)).toBe(
      expected
    );
  });
});
