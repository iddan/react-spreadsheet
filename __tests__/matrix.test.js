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
});
