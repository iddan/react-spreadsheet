import * as EntireRows from "./entire-rows";
import * as PointRange from "./point-range";
import * as Selection from "./selection";
import * as Selections from "./selections";

const ROW = Selection.createEntireRows(2, 2);

describe("EntireRows.checkIfNeighborRows()", () => {
  const neighbor1 = Selection.createEntireRows(1, 1);
  const neighbor2 = Selection.createEntireRows(3, 3);
  const notNeighbor1 = Selection.createEntireRows(0, 0);
  const notNeighbor2 = Selection.createEntireRows(4, 4);
  const notNeighbor3 = Selection.createEntireRows(0, 5);

  const cases = [
    ["neighbor rows above", [ROW, neighbor1], true],
    ["neighbor rows below", [ROW, neighbor2], true],
    ["NOT neighbor rows above", [ROW, notNeighbor1], false],
    ["NOT neighbor rows below", [ROW, notNeighbor2], false],
    ["NOT neighbor full table", [ROW, notNeighbor3], false],
  ] as const;
  test.each(cases)("%s", (name, values, expected) => {
    expect(EntireRows.checkIfNeighborRows(...values)).toBe(expected);
  });
});

describe("EntireRows.checkIfOverlappingRows()", () => {
  const overlapping1 = Selection.createEntireRows(1, 2);
  const overlapping2 = Selection.createEntireRows(2, 3);
  const overlapping3 = Selection.createEntireRows(0, 5);
  const notOverlapping1 = Selection.createEntireRows(0, 0);
  const notOverlapping2 = Selection.createEntireRows(4, 4);

  const cases = [
    ["overlapping rows above", [ROW, overlapping1], true],
    ["overlapping rows below", [ROW, overlapping2], true],
    ["overlapping rows full table", [ROW, overlapping3], true],
    ["NOT overlapping rows above", [ROW, notOverlapping1], false],
    ["NOT overlapping rows below", [ROW, notOverlapping2], false],
  ] as const;
  test.each(cases)("%s", (name, values, expected) => {
    expect(EntireRows.checkIfOverlappingRows(...values)).toBe(expected);
  });
});

// describe("EntireRows.canMergeRows()", () => {
//   const overlapping1 = Selection.createEntireRows(1, 2);
//   const overlapping2 = Selection.createEntireRows(2, 3);
//   const overlapping3 = Selection.createEntireRows(0, 5);
//   const notOverlapping1 = Selection.createEntireRows(0, 0);
//   const notOverlapping2 = Selection.createEntireRows(4, 4);

//   const cases = [
//     ["overlapping rows above", [ROW, overlapping1], true],
//     ["overlapping rows below", [ROW, overlapping2], true],
//     ["overlapping rows full table", [ROW, overlapping3], true],
//     ["NOT overlapping rows above", [ROW, notOverlapping1], false],
//     ["NOT overlapping rows below", [ROW, notOverlapping2], false],
//   ] as const;
//   test.each(cases)("%s", (name, values, expected) => {
//     expect(EntireRows.canMergeRows(...values)).toBe(expected);
//   });
// });

describe("EntireRows.checkRowOverlappingPointRange()", () => {
  const cases = [
    [
      "row overlapping range top",
      [ROW, PointRange.create({ row: 2, column: 2 }, { row: 4, column: 4 })],
      true,
    ],
    [
      "row overlapping range inside",
      [ROW, PointRange.create({ row: 1, column: 1 }, { row: 3, column: 3 })],
      true,
    ],
    [
      "row overlapping range inside 2",
      [ROW, PointRange.create({ row: 2, column: 1 }, { row: 2, column: 4 })],
      true,
    ],
    [
      "row overlapping range bottom",
      [ROW, PointRange.create({ row: 0, column: 0 }, { row: 2, column: 2 })],
      true,
    ],
    [
      "row NOT overlapping range top",
      [ROW, PointRange.create({ row: 0, column: 1 }, { row: 1, column: 3 })],
      false,
    ],
    [
      "row NOT overlapping range bottom",
      [ROW, PointRange.create({ row: 3, column: 1 }, { row: 3, column: 3 })],
      false,
    ],
  ] as const;
  test.each(cases)("%s", (name, [selectionRow, selectionRange], expected) => {
    expect(
      EntireRows.checkRowOverlappingPointRange(selectionRow, selectionRange)
    ).toBe(expected);
  });
});

describe("EntireRows.mergeRowWithPointRange()", () => {
  const cases = [
    [
      "merge row and point range start",
      [ROW, PointRange.create({ row: 2, column: 2 }, { row: 4, column: 4 })],
      [ROW, PointRange.create({ row: 3, column: 2 }, { row: 4, column: 4 })],
    ],
    [
      "merge row and point range middle",
      [ROW, PointRange.create({ row: 1, column: 1 }, { row: 3, column: 3 })],
      [
        PointRange.create({ row: 1, column: 1 }, { row: 1, column: 3 }),
        ROW,
        PointRange.create({ row: 3, column: 1 }, { row: 3, column: 3 }),
      ],
    ],
    [
      "merge row and point range middle 2",
      [ROW, PointRange.create({ row: 2, column: 1 }, { row: 2, column: 3 })],
      [ROW],
    ],
    [
      "merge row and point range end",
      [ROW, PointRange.create({ row: 0, column: 0 }, { row: 2, column: 2 })],
      [PointRange.create({ row: 0, column: 0 }, { row: 1, column: 2 }), ROW],
    ],
    [
      "NOT merge row and point range start",
      [ROW, PointRange.create({ row: 0, column: 1 }, { row: 1, column: 3 })],
      [ROW, PointRange.create({ row: 0, column: 1 }, { row: 1, column: 3 })],
    ],
    [
      "NOT merge row and point range end",
      [ROW, PointRange.create({ row: 3, column: 1 }, { row: 3, column: 3 })],
      [ROW, PointRange.create({ row: 3, column: 1 }, { row: 3, column: 3 })],
    ],
  ] as const;
  test.each(cases)("%s", (name, [selectionRow, selectionRange], expected) => {
    expect(
      EntireRows.mergeRowWithPointRange(selectionRow, selectionRange)
    ).toStrictEqual(expected);
  });
});
