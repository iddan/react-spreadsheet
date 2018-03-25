import createContext from "create-react-context";

export default createContext();

export const CELL_VALUE_CHANGE = Symbol("CELL_VALUE_CHANGE");
export const CELL_MODE_CHANGE = Symbol("CELL_MODE_CHANGE");
export const CELL_SELECT = Symbol("CELL_SELECT");
