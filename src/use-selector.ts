import { useContextSelector } from "use-context-selector";
import context from "./context";
import * as Types from "./types";

function useSelector<T>(selector: (state: Types.StoreState) => T): T {
  return useContextSelector(context, ([state]) => selector(state));
}

export default useSelector;
