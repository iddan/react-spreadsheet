declare module "fast-formula-parser" {
  export type CellCoord = {
    row: number;
    col: number;
  };
  export type CellRef = CellCoord & {
    sheet: string;
  };
  export type RangeRef = {
    from: CellRef;
    to: CellRef;
    sheet: string;
  };
  export type BaseValue = number | string | boolean;
  export type Value = BaseValue | BaseValue[];
  export type FormulaParserConfig = {
    onCell?: (ref: CellRef) => Value;
    onRange?: (range: RangeRef) => Value[];
    onVariable?: (name: string, sheetName: string) => CellRef | RangeRef;
  };

  export class FormulaError extends Error {
    /**
     * @param error - error code, i.e. #NUM!
     * @param msg - detailed error message
     * @param details - additional details
     */
    constructor(error: string, msg?: string, details?: object | Error);

    /** Return true if two errors are same */
    equals(error: Error): boolean;

    /** Return the formula error in string representation. */
    toString(): string;

    static DIV0 = "#DIV/0!";
    static NA = "#N/A";
    static NAME = "#NAME?";
    static NULL = "#NULL!";
    static NUM = "#NUM!";
    static REF = "#REF!";
    static VALUE = "#VALUE!";
  }

  export default class FormulaParser {
    constructor(config: FormulaParserConfig);
    parse(
      inputText: string,
      position: CellRef,
      allowReturnArray: boolean = false
    ): Value | FormulaError;
  }

  export class DepParser {
    parse(fromula: string, position: CellRef): Array<CellRef | RangeRef>;
  }
}
