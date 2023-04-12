import FormulaParser, {
  CellRef,
  DepParser,
  FormulaError,
  Value,
} from "fast-formula-parser";
import * as pointSet from "./point-set";
import { Point } from "./point";
import * as matrix from "./matrix";
import { CellBase } from "./types";

export const FORMULA_VALUE_PREFIX = "=";

/** Returns whether given value is a formula */
export function isFormulaValue(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.startsWith(FORMULA_VALUE_PREFIX) &&
    value.length > 1
  );
}

/** Extracts formula from value  */
export function extractFormula(value: string): string {
  return value.slice(1);
}

export function createBoundFormulaParser(
  getData: () => matrix.Matrix<CellBase>
): FormulaParser {
  return new FormulaParser({
    onCell: (ref) => {
      const point: Point = {
        row: ref.row - 1,
        column: ref.col - 1,
      };
      const cell = matrix.get(point, getData());
      if (!isNaN(cell?.value as number)) return Number(cell?.value);
      return cell?.value;
    },
    onRange: (ref) => {
      const start: Point = {
        row: ref.from.row - 1,
        column: ref.from.col - 1,
      };
      const end: Point = {
        row: ref.to.row - 1,
        column: ref.to.col - 1,
      };
      return matrix.toArray(matrix.slice(start, end, getData()), (cell) => {
        if (!isNaN(cell?.value as number)) return Number(cell?.value);
        return cell?.value;
      });
    },
  });
}

const depParser = new DepParser();

/**
 * For given formula returns the cell references
 * @param formula - formula to get references for
 */
export function getReferences(
  formula: string,
  point: Point
): pointSet.PointSet {
  try {
    const dependencies = depParser.parse(formula, convertPointToCellRef(point));
    const references = pointSet.from(
      dependencies.flatMap((reference) => {
        const isRange = "from" in reference;
        if (isRange) {
          const { from, to } = reference;
          const points: Point[] = [];
          for (let row = from.row; row <= to.row; row++) {
            for (let column = from.col; column <= to.col; column++) {
              points.push({ row: row - 1, column: column - 1 });
            }
          }
          return points;
        }
        return { row: reference.row - 1, column: reference.col - 1 };
      })
    );
    return references;
  } catch (error) {
    if (error instanceof FormulaError) {
      return pointSet.from([]);
    } else {
      throw error;
    }
  }
}

export function evaluate(
  formula: string,
  point: Point,
  formulaParser: FormulaParser
): Value {
  try {
    const returned = formulaParser.parse(formula, convertPointToCellRef(point));
    return returned instanceof FormulaError ? returned.toString() : returned;
  } catch (error) {
    if (error instanceof FormulaError) {
      return error.toString();
    }
    throw error;
  }
}

function convertPointToCellRef(point: Point): CellRef {
  return {
    row: point.row + 1,
    col: point.column + 1,
    /** @todo fill once we support multiple sheets */
    sheet: "Sheet1",
  };
}
