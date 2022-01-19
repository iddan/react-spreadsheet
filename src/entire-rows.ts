import { Matrix } from ".";
import * as Point from "./point";
import * as PointRange from "./point-range";
import * as Selection from "./selection";
import * as Selections from "./selections";

export function checkIfNeighborRows(
  selection1: Selection.EntireRows,
  selection2: Selection.EntireRows
): boolean {
  return (
    selection1.end + 1 === selection2.start ||
    selection2.end + 1 === selection1.start
  );
}

export function checkIfOverlappingRows(
  selection1: Selection.EntireRows,
  selection2: Selection.EntireRows
): boolean {
  return (
    (selection1.start <= selection2.start &&
      selection1.end >= selection2.start) ||
    (selection2.start <= selection1.start && selection2.end >= selection1.start)
  );
}

export function canMergeRows(
  selection1: Selection.EntireRows,
  selection2: Selection.EntireRows
): boolean {
  return (
    checkIfNeighborRows(selection1, selection2) ||
    checkIfOverlappingRows(selection1, selection2)
  );
}

export function mergeEntireRows(
  selection1: Selection.EntireRows,
  selection2: Selection.EntireRows
): Selection.EntireRows {
  const minRow = Math.min(selection1.start, selection2.start);
  const maxRow = Math.max(selection1.end, selection2.end);
  return Selection.createEntireRows(minRow, maxRow);
}

export function checkRowOverlappingPointRange(
  selection1: Selection.EntireRows,
  selection2: PointRange.PointRange
): boolean {
  const [rowStart, rowEnd] = [selection1.start, selection1.end];
  const [rangeRowStart, rangeRowEnd] = [
    selection2.start.row,
    selection2.end.row,
  ];
  return (
    (rangeRowStart <= rowStart && rangeRowEnd >= rowStart) ||
    (rangeRowStart <= rowEnd && rangeRowEnd >= rowEnd)
  );
}

export function mergeRowWithPointRange(
  row: Selection.EntireRows,
  range: PointRange.PointRange
): Selections.Selections {
  if (checkRowOverlappingPointRange(row, range)) {
    let rowAdded = false;
    const newSelections = [];
    const minRow = Math.min(row.start, row.end, range.start.row, range.end.row);
    const maxRow = Math.max(row.start, row.end, range.start.row, range.end.row);
    let newRange: { start: Point.Point | null; end: Point.Point | null } = {
      start: null,
      end: null,
    };

    for (let r = minRow; r <= maxRow; r++) {
      if (r >= row.start && r <= row.end) {
        if (newRange.start && newRange.end) {
          newSelections.push(PointRange.create(newRange.start, newRange.end));
          newRange = { start: null, end: null };
        }
        if (!rowAdded) {
          rowAdded = true;
          newSelections.push(row);
        }
      } else {
        if (!newRange.start) {
          newRange = {
            start: { row: r, column: range.start.column },
            end: { row: r, column: range.end.column },
          };
        } else if (newRange.end?.row !== r) {
          newRange = {
            ...newRange,
            end: { row: r, column: range.end.column },
          };
        }
      }

      if (newRange.start && newRange.end && r === maxRow) {
        newSelections.push(PointRange.create(newRange.start, newRange.end));
        newRange = { start: null, end: null };
      }
    }

    return newSelections;
  }
  return [row, range];
}

// export function mergeRowWithColumn(
//   row: Selection.EntireRows,
//   column: Selection.EntireColumns
// ): Selections.Selections {

// }

export function mergeSelectionsWithRow(
  selections: Selections.Selections,
  selection: Selection.EntireRows
): Selections.Selections {
  if (!selection) {
    return selections;
  }

  if (!selections.length) {
    return [selection];
  }

  const rest = [];
  let newRow = { ...selection };

  for (let i = 0; i < selections.length; i++) {
    const s = selections[i];
    if (PointRange.is(s)) {
      rest.push(...mergeRowWithPointRange(selection, s));
    } else if (Selection.isEntireRows(s) && canMergeRows(s, newRow)) {
      newRow = mergeEntireRows(s, newRow);
    } else if (Selection.isEntireColumns(s)) {
      // rest.push(...mergeRowWithColumn(selection, s));
    } else if (Selection.isEntireTable(s)) {
      return [s];
    } else {
      rest.push(s);
    }
  }

  return [newRow, ...rest];
}
