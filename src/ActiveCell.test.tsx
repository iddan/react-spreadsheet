/**
 * @jest-environment jsdom
 */

import * as React from "react";
import { render } from "@testing-library/react";
import ActiveCell from "./ActiveCell";
import context from "./context";
import { INITIAL_STATE } from "./reducer";

describe("<ActiveCell />", () => {
  test("renders", () => {
    render(
      <context.Provider value={[INITIAL_STATE, jest.fn()]}>
        <ActiveCell DataEditor={jest.fn()} getBindingsForCell={jest.fn()} />
      </context.Provider>
    );
  });
});
