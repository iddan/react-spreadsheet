/**
 * @jest-environment jsdom
 */

import * as React from "react";
import { render } from "@testing-library/react";
import Copied from "./Copied";
import context from "./context";
import { INITIAL_STATE } from "./reducer";

describe("<Copied />", () => {
  test("renders", () => {
    render(
      <context.Provider value={[INITIAL_STATE, jest.fn()]}>
        <Copied />
      </context.Provider>
    );
  });
});
