import * as React from "react";
import { createContext } from "use-context-selector";
import { reducer, INITIAL_STATE } from "./reducer";

export type ReducerState = React.ReducerState<typeof reducer>;
export type Dispatch = React.Dispatch<React.ReducerAction<any>>;
export type Value = [ReducerState, Dispatch];

const context = createContext<Value>([INITIAL_STATE, () => {}]);

export default context;
