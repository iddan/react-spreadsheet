import { range, flatMap } from "../src/util";

describe("range method:", () => {
  test("basic use of range", () => {
    const end = 10;
    const start = 1;
    const step = 2;
    const res = range(end, start, step);

    expect(res).toEqual([1, 3, 5, 7, 9]);
  });

  test("range with negative numbers", () => {
    const end = 10;
    const start = -10;
    const step = 2;

    const res = range(end, start, step);

    expect(res).toEqual([-10, -8, -6, -4, -2, 0, 2, 4, 6, 8]);
  });

  test("range with opposite parameters  return an incremented array", () => {
    const start = 1;
    const end = 5;
    const res = range(end);

    console.log(res);
  });
});

describe("flatMap method:", () => {
  test("most basic use of flatMap", () => {
    const array = [1, 2, 3, 4, 5];
    const map = item => item + 1;

    const res = flatMap(array, map);
    expect(res).toEqual([2, 3, 4, 5, 6]);
  });

  test("the way Matrix.flatMap want to use it");
});
