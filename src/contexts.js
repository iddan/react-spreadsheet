// @flow

import createReactContext from "create-react-context";
import type { Context } from "create-react-context";
import * as Types from "./types";

export const Data: Context<*[][]> = createReactContext([]);
export const Active: Context<?Types.Active<*>> = createReactContext(null);
