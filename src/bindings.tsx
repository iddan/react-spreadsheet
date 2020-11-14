import * as Types from "./types";
import * as Matrix from "./matrix";
import { extractLabel } from "hot-formula-parser/lib/helper/cell";

function isFormulaCell<
  Cell extends Types.CellBase & {
    value: any;
  }
>(cell: Cell): boolean {
  return Boolean(
    cell &&
      cell.value &&
      typeof cell.value === "string" &&
      cell.value.startsWith("=")
  );
}

const FORMULA_CELL_REFERENCES = /\$?[A-Z]+\$?[0-9]+/g;

/** @todo move me */
export function getBindingsForCell<
  Cell extends Types.CellBase & {
    value: any;
  }
>(cell: Cell, data: Matrix.Matrix<Cell>): Types.Point[] {
  if (!isFormulaCell(cell)) {
    return [];
  }
  const { value } = cell;
  if (typeof value !== "string") {
    return [];
  }
  // Get raw cell references from formula
  const match = value.match(FORMULA_CELL_REFERENCES);
  if (!match) {
    return [];
  }
  // Normalize references to points
  return match
    .map((substr) => {
      const [row, column] = extractLabel(substr);
      const dependentCell = Matrix.get(row.index, column.index, data);
      const bindingsForDependentCell = dependentCell
        ? getBindingsForCell(dependentCell, data)
        : [];
      return [
        { row: row.index, column: column.index },
        ...bindingsForDependentCell,
      ];
    }, {})
    .flat();
}
