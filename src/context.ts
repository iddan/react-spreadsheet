import * as React from "react";
import { createContext } from "use-context-selector";
import { reducer, INITIAL_STATE } from "./reducer";

const context = createContext<
  [React.ReducerState<typeof reducer>, React.Dispatch<React.ReducerAction<any>>]
>([INITIAL_STATE, () => {}]);

export default context;
