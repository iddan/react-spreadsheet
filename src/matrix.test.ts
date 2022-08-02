import * as Matrix from "./matrix";
import * as Point from "./point";

const createExampleMatrix = (): Matrix.Matrix<number> => [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

const EXAMPLE_MATRIX: Matrix.Matrix<number> = createExampleMatrix();
const EXISTING_POINT: Point.Point = {
  row: 2,
  column: 2,
};
const NON_EXISTING_POINT: Point.Point = {
  row: 3,
  column: 3,
};
const CSV = "1\t2\t3\n4\t5\t6\n7\t8\t9";
const EXAMPLE_VALUE = 42;

describe("Matrix.get()", () => {
  test("Gets value", () => {
    expect(Matrix.get(EXISTING_POINT, EXAMPLE_MATRIX)).toBe(9);
  });
  test("Returns undefined for missing coordinate", () => {
    expect(Matrix.get(NON_EXISTING_POINT, EXAMPLE_MATRIX)).toBe(undefined);
  });
});

describe("Matrix.getSize()", () => {
  test("Gives columns and rows", () => {
    expect(Matrix.getSize(EXAMPLE_MATRIX)).toEqual({ rows: 3, columns: 3 });
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
    expect(Matrix.join(EXAMPLE_MATRIX)).toEqual(CSV);
  });
});

describe("Matrix.split()", () => {
  test("Constructs a matrix from a CSV string", () => {
    expect(Matrix.split(CSV, Number)).toEqual(EXAMPLE_MATRIX);
  });
});

describe("Matrix.set()", () => {
  test("Sets value", () => {
    const nextMatrix = Matrix.set(
      EXISTING_POINT,
      EXAMPLE_VALUE,
      EXAMPLE_MATRIX
    );
    expect(Matrix.get(EXISTING_POINT, nextMatrix)).toBe(EXAMPLE_VALUE);
  });
  test("Modifies matrix for out of range coordinate", () => {
    const nextMatrix = Matrix.set(
      NON_EXISTING_POINT,
      EXAMPLE_VALUE,
      EXAMPLE_MATRIX
    );
    expect(Matrix.get(NON_EXISTING_POINT, nextMatrix)).toBe(EXAMPLE_VALUE);
    expect(Matrix.getSize(nextMatrix)).toEqual({ columns: 4, rows: 4 });
  });
});

describe("Matrix.mutableSet()", () => {
  test("Sets value", () => {
    const matrix = createExampleMatrix();
    Matrix.mutableSet(EXISTING_POINT, EXAMPLE_VALUE, matrix);
    expect(Matrix.get(EXISTING_POINT, matrix)).toBe(EXAMPLE_VALUE);
  });
  test("Modifies matrix for out of range coordinate", () => {
    const matrix: Matrix.Matrix<number> = createExampleMatrix();
    const value = 42;
    Matrix.mutableSet(NON_EXISTING_POINT, value, matrix);
    expect(Matrix.get(NON_EXISTING_POINT, matrix)).toBe(EXAMPLE_VALUE);
    expect(Matrix.getSize(matrix)).toEqual({
      columns: NON_EXISTING_POINT.column + 1,
      rows: NON_EXISTING_POINT.row + 1,
    });
  });
  test("Creates first row in matrix if out of range", () => {
    const matrix: Matrix.Matrix<number> = [];
    Matrix.mutableSet(Point.ORIGIN, EXAMPLE_VALUE, matrix);
    expect(Matrix.get(Point.ORIGIN, matrix)).toBe(EXAMPLE_VALUE);
  });
});

describe("Matrix.unset()", () => {
  test("Removes the coordinate of matrix", () => {
    const nextMatrix = Matrix.unset(EXISTING_POINT, EXAMPLE_MATRIX);
    expect(Matrix.get(EXISTING_POINT, nextMatrix)).toBe(undefined);
  });
  test("Returns same matrix if nothing changed", () => {
    expect(Matrix.unset(NON_EXISTING_POINT, EXAMPLE_MATRIX)).toBe(
      EXAMPLE_MATRIX
    );
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
    expect(Matrix.map((value) => value && value * 2, EXAMPLE_MATRIX)).toEqual([
      [2, 4, 6],
      [8, 10, 12],
      [14, 16, 18],
    ]);
  });
});

describe("Matrix.padRows()", () => {
  test("Pads matrix with empty rows to match given total rows", () => {
    expect(Matrix.padRows(EXAMPLE_MATRIX, 5)).toEqual([
      ...EXAMPLE_MATRIX,
      [undefined, undefined, undefined],
      [undefined, undefined, undefined],
    ]);
  });
  test("Does nothing if matrix has total rows", () => {
    expect(Matrix.padRows(EXAMPLE_MATRIX, 3)).toBe(EXAMPLE_MATRIX);
  });
});

describe("Matrix.pad()", () => {
  test("Pads matrix with empty columns and columns to match given size", () => {
    expect(Matrix.pad(EXAMPLE_MATRIX, { rows: 5, columns: 4 })).toEqual([
      [1, 2, 3, undefined],
      [4, 5, 6, undefined],
      [7, 8, 9, undefined],
      [undefined, undefined, undefined, undefined],
      [undefined, undefined, undefined, undefined],
    ]);
  });
  test("Pads rows only.", () => {
    expect(Matrix.pad(EXAMPLE_MATRIX, { rows: 5, columns: 3 })).toEqual([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      [undefined, undefined, undefined],
      [undefined, undefined, undefined],
    ]);
  });
  test("Pads columns only.", () => {
    expect(Matrix.pad(EXAMPLE_MATRIX, { rows: 2, columns: 5 })).toEqual([
      [1, 2, 3, undefined, undefined],
      [4, 5, 6, undefined, undefined],
      [7, 8, 9, undefined, undefined],
    ]);
  });
  test("Does nothing if matrix is large enough.", () => {
    expect(Matrix.pad(EXAMPLE_MATRIX, { rows: 3, columns: 2 })).toBe(
      EXAMPLE_MATRIX
    );
  });
});

describe("Matrix.toArray()", () => {
  const flattedMatrix = [
    ...EXAMPLE_MATRIX[0],
    ...EXAMPLE_MATRIX[1],
    ...EXAMPLE_MATRIX[2],
  ];
  test("Flattens square matrix values to an array", () => {
    expect(Matrix.toArray(EXAMPLE_MATRIX)).toEqual(flattedMatrix);
  });
  test("Flattens horizontal matrix values to an array", () => {
    expect(
      Matrix.toArray([
        [1, 2, 3],
        [4, 5, 6],
      ])
    ).toEqual([1, 2, 3, 4, 5, 6]);
  });
  test("Flattens vertical matrix values to an array", () => {
    expect(
      Matrix.toArray([
        [1, 2],
        [3, 4],
        [5, 6],
      ])
    ).toEqual([1, 2, 3, 4, 5, 6]);
  });
  test("Flattens column matrix values to an array", () => {
    expect(Matrix.toArray([[1], [2], [3]])).toEqual([1, 2, 3]);
  });
  test("Flattens row matrix values to an array", () => {
    expect(Matrix.toArray([[1, 2, 3]])).toEqual([1, 2, 3]);
  });
  test("Transforms matrix values and collects them to an array", () => {
    const transform = (value: number | undefined) => value && value * 2;
    expect(
      Matrix.toArray<number, number | undefined>(EXAMPLE_MATRIX, transform)
    ).toEqual(flattedMatrix.map(transform));
  });
});

describe("Matrix.maxPoint()", () => {
  test("Returns maximum point of given matrix", () => {
    return expect(Matrix.maxPoint(EXAMPLE_MATRIX)).toEqual({
      row: 2,
      column: 2,
    });
  });
});

describe("Matrix.createEmpty()", () => {
  test("Creates empty matrix with given rows and columns", () => {
    const rows = 2;
    const columns = 3;
    const matrix = Matrix.createEmpty(rows, columns);
    expect(matrix.length).toEqual(rows);
    for (const row of matrix) {
      expect(row).toEqual(Array(columns));
    }
  });
});
