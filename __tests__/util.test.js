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

  /* Is it what we want ?
  the case I have in my head is the current bug with backward select
  where we have an endPoint and we send a new startPoint

  from what I understand we need to have an chornologicly incremented array,
  but I was'nt sure, so I want to know what do you thing */
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
