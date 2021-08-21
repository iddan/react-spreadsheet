import * as Matrix from "./matrix";
import { Point } from "./types";

const MATRIX = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

const EXISTING_POINT: Point = {
  row: 2,
  column: 2,
};

const NON_EXISTING_POINT: Point = {
  row: 3,
  column: 3,
};

const CSV = "1\t2\t3\n4\t5\t6\n7\t8\t9";

describe("Matrix.get()", () => {
  test("Gets value", () => {
    expect(Matrix.get(EXISTING_POINT, MATRIX)).toBe(9);
  });
  test("Returns undefined for missing coordinate", () => {
    expect(Matrix.get(NON_EXISTING_POINT, MATRIX)).toBe(undefined);
  });
});

describe("Matrix.getSize()", () => {
  test("Gives columns and rows", () => {
    expect(Matrix.getSize(MATRIX)).toEqual({ rows: 3, columns: 3 });
  });
  test("Relies on first row for columns", () => {
    expect(
      Matrix.getSize([
        [1, 2, 3, 4],
        [1, 2, 3],
      ])
    ).toEqual({
      rows: 2,
      columns: 4,
    });
    expect(
      Matrix.getSize([
        [1, 2, 3],
        [1, 2, 3, 4],
      ])
    ).toEqual({
      rows: 2,
      columns: 3,
    });
  });
});

describe("Matrix.join()", () => {
  test("Constructs a CSV string from a matrix", () => {
    expect(Matrix.join(MATRIX)).toEqual(CSV);
  });
});

describe("Matrix.split()", () => {
  test("Constructs a matrix from a CSV string", () => {
    expect(Matrix.split(CSV, Number)).toEqual(MATRIX);
  });
});

describe("Matrix.set()", () => {
  test("Sets value", () => {
    const nextMatrix = Matrix.set(2, 2, 42, MATRIX);
    expect(Matrix.get(EXISTING_POINT, nextMatrix)).toBe(42);
  });
  test("Modifies matrix for out of range coordinate", () => {
    const nextMatrix = Matrix.set(3, 3, 42, MATRIX);
    expect(Matrix.get(NON_EXISTING_POINT, nextMatrix)).toBe(42);
    expect(Matrix.getSize(nextMatrix)).toEqual({ columns: 4, rows: 4 });
  });
});

describe("Matrix.mutableSet()", () => {
  test("Sets value", () => {
    const matrix = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    const value = 42;
    Matrix.mutableSet(EXISTING_POINT.row, EXISTING_POINT.column, value, matrix);
    expect(Matrix.get(EXISTING_POINT, matrix)).toBe(value);
  });
  test("Modifies matrix for out of range coordinate", () => {
    const matrix = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    const value = 42;
    Matrix.mutableSet(
      NON_EXISTING_POINT.row,
      NON_EXISTING_POINT.column,
      value,
      matrix
    );
    expect(Matrix.get(NON_EXISTING_POINT, matrix)).toBe(42);
    expect(Matrix.getSize(matrix)).toEqual({
      columns: NON_EXISTING_POINT.column + 1,
      rows: NON_EXISTING_POINT.row + 1,
    });
  });
  test("Creates first row in matrix if out of range", () => {
    const matrix: Matrix.Matrix<number> = [];
    const value = 42;
    const row = 0;
    const column = 0;
    Matrix.mutableSet(row, column, value, matrix);
    expect(Matrix.get({ row, column }, matrix)).toBe(42);
  });
});

describe("Matrix.unset()", () => {
  test("Removes the coordinate of matrix", () => {
    const nextMatrix = Matrix.unset(
      EXISTING_POINT.row,
      EXISTING_POINT.column,
      MATRIX
    );
    expect(Matrix.get(EXISTING_POINT, nextMatrix)).toBe(undefined);
  });
  test("Returns same matrix if nothing changed", () => {
    expect(Matrix.unset(5, 5, MATRIX)).toBe(MATRIX);
  });
});

describe("Matrix.slice()", () => {
  const matrix = [
    [1, 2, 3, 4, 5],
    [11, 12, 13, 14, 15],
    [21, 22, 23, 24, 25],
    [31, 32, 33, 34, 35],
    [41, 42, 43, 44, 45],
  ];

  test("Creates a slice of matrix from startPoint up to, but not including, endPoint", () => {
    expect(
      Matrix.slice({ row: 1, column: 2 }, { row: 3, column: 3 }, matrix)
    ).toEqual([
      [13, 14],
      [23, 24],
      [33, 34],
    ]);
    expect(
      Matrix.slice({ row: 2, column: 2 }, { row: 4, column: 3 }, matrix)
    ).toEqual([
      [23, 24],
      [33, 34],
      [43, 44],
    ]);
  });
});

describe("Matrix.map()", () => {
  test("Creates an array of values by running each element in collection thru iteratee", () => {
    expect(Matrix.map((value) => value && value * 2, MATRIX)).toEqual([
      [2, 4, 6],
      [8, 10, 12],
      [14, 16, 18],
    ]);
  });
});

describe("Matrix.padRows()", () => {
  test("Pads matrix with empty rows to match given total rows", () => {
    expect(Matrix.padRows(MATRIX, 5)).toEqual([
      ...MATRIX,
      [undefined, undefined, undefined],
      [undefined, undefined, undefined],
    ]);
  });
  test("Does nothing if matrix has total rows", () => {
    expect(Matrix.padRows(MATRIX, 3)).toBe(MATRIX);
  });
});

describe("Matrix.toArray()", () => {
  const flattedMatrix = [...MATRIX[0], ...MATRIX[1], ...MATRIX[2]];
  test("Flattens matrix values to an array", () => {
    expect(Matrix.toArray(MATRIX)).toEqual(flattedMatrix);
  });
  test("Transforms matrix values and collects them to an array", () => {
    const transform = (value: number | undefined) => value && value * 2;
    expect(
      Matrix.toArray<number, number | undefined>(MATRIX, transform)
    ).toEqual(flattedMatrix.map(transform));
  });
});
