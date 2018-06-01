import * as Matrix from "../src/matrix";
import { range } from "../src/matrix";

describe("Matrix:", () => {
  test("basic use of range method", () => {
    const startPoint = { row: 1, column: 1 };
    const endPoint = { row: 5, column: 5 };

    const res = range(endPoint, startPoint);

    const length = res.length;

    expect(res.length).toBe(16);
    expect(res[length - 1]).toEqual({ row: 4, column: 4 });
    expect(res[0]).toEqual({ row: 1, column: 1 });
  });

  test("failing when endPoint and statPoint accidently being switched", () => {
    const startPoint = { row: 1, column: 1 };
    const endPoint = { row: 5, column: 5 };

    const res = range(startPoint, endPoint);
    /** @todo */
  });

  test("Matrix.slice()", () => {
    const matrix = [
      [1, 2, 3, 4, 5],
      [11, 12, 13, 14, 15],
      [21, 22, 23, 24, 25],
      [31, 32, 33, 34, 35],
      [41, 42, 43, 44, 45]
    ];

    expect(
      Matrix.slice({ row: 1, column: 2 }, { row: 3, column: 3 }, matrix)
    ).toEqual([[13, 14], [23, 24], [33, 34]]);
    expect(
      Matrix.slice({ row: 2, column: 2 }, { row: 4, column: 3 }, matrix)
    ).toEqual([[23, 24], [33, 34], [43, 44]]);
  });
});
