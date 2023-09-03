import * as React from "react";
import { createContext } from "use-context-selector";
import reducer, { INITIAL_STATE } from "./reducer";
import { Action } from "./actions";

export type ReducerState = React.ReducerState<typeof reducer>;
export type Dispatch = React.Dispatch<Action>;
export type Value = [ReducerState, Dispatch];

const context = createContext<Value>([INITIAL_STATE, () => {}]);

export default context;
