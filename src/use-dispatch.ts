import context, { Dispatch } from "./context";
import { useContextSelector } from "use-context-selector";

function useDispatch(): Dispatch {
  return useContextSelector(context, ([state, dispatch]) => dispatch);
}

export default useDispatch;
