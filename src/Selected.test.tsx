/**
 * @jest-environment jsdom
 */

import * as React from "react";
import { render } from "@testing-library/react";
import Selected from "./Selected";
import context from "./context";
import { INITIAL_STATE } from "./reducer";

describe("<Selected />", () => {
  test("renders", () => {
    render(
      <context.Provider value={[INITIAL_STATE, jest.fn()]}>
        <Selected />
      </context.Provider>
    );
  });
});
