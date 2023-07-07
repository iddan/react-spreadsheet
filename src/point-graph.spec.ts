import * as pointMap from "./point-map";
import * as pointSet from "./point-set";
import { PointGraph } from "./point-graph";

const EMPTY = PointGraph.from([]);

describe("PointGraph.from", () => {
  test("empty", () => {
    const graph = PointGraph.from([]);
    expect(graph).toEqual({
      backward: pointMap.from([]),
      forward: pointMap.from([]),
    });
  });
  test("single edge", () => {
    const graph = PointGraph.from([
      [{ row: 0, column: 0 }, pointSet.from([{ row: 0, column: 1 }])],
    ]);
    expect(graph).toEqual({
      backward: pointMap.from([
        [{ row: 0, column: 1 }, pointSet.from([{ row: 0, column: 0 }])],
      ]),
      forward: pointMap.from([
        [{ row: 0, column: 0 }, pointSet.from([{ row: 0, column: 1 }])],
      ]),
    });
  });
  test("two edges", () => {
    const graph = PointGraph.from([
      [
        { row: 0, column: 0 },
        pointSet.from([
          { row: 0, column: 1 },
          { row: 0, column: 2 },
        ]),
      ],
    ]);
    expect(graph).toEqual({
      backward: pointMap.from([
        [{ row: 0, column: 1 }, pointSet.from([{ row: 0, column: 0 }])],
        [{ row: 0, column: 2 }, pointSet.from([{ row: 0, column: 0 }])],
      ]),
      forward: pointMap.from([
        [
          { row: 0, column: 0 },
          pointSet.from([
            { row: 0, column: 1 },
            { row: 0, column: 2 },
          ]),
        ],
      ]),
    });
  });
});

describe("PointGraph.set", () => {
  test("add single edge to empty", () => {
    expect(
      EMPTY.set({ row: 0, column: 0 }, pointSet.from([{ row: 0, column: 1 }]))
    ).toEqual(
      PointGraph.from([
        [{ row: 0, column: 0 }, pointSet.from([{ row: 0, column: 1 }])],
      ])
    );
  });
  test("add two edges to empty", () => {
    expect(
      EMPTY.set(
        { row: 0, column: 0 },
        pointSet.from([
          { row: 0, column: 1 },
          { row: 0, column: 2 },
        ])
      )
    ).toEqual(
      PointGraph.from([
        [
          { row: 0, column: 0 },
          pointSet.from([
            { row: 0, column: 1 },
            { row: 0, column: 2 },
          ]),
        ],
      ])
    );
  });
  test("remove single edge", () => {
    const graph = PointGraph.from([
      [{ row: 0, column: 0 }, pointSet.from([{ row: 0, column: 1 }])],
    ]);
    expect(graph.set({ row: 0, column: 0 }, pointSet.from([]))).toEqual(
      PointGraph.from([])
    );
  });
  test("remove and add single edges", () => {
    const graph = PointGraph.from([
      [{ row: 0, column: 0 }, pointSet.from([{ row: 0, column: 1 }])],
    ]);
    expect(
      graph.set({ row: 0, column: 0 }, pointSet.from([{ row: 0, column: 2 }]))
    ).toEqual(
      PointGraph.from([
        [{ row: 0, column: 0 }, pointSet.from([{ row: 0, column: 2 }])],
      ])
    );
  });
  test("add and remove multiple edges", () => {
    let graph = EMPTY;
    graph = graph.set(
      { row: 0, column: 0 },
      pointSet.from([
        { row: 0, column: 1 },
        { row: 0, column: 2 },
      ])
    );
    graph = graph.set(
      { row: 0, column: 1 },
      pointSet.from([{ row: 0, column: 2 }])
    );
    expect(graph).toEqual(
      PointGraph.from([
        [
          { row: 0, column: 0 },
          pointSet.from([
            { row: 0, column: 1 },
            { row: 0, column: 2 },
          ]),
        ],
        [{ row: 0, column: 1 }, pointSet.from([{ row: 0, column: 2 }])],
      ])
    );
    graph = graph.set({ row: 0, column: 0 }, pointSet.from([]));
    expect(graph).toEqual(
      PointGraph.from([
        [{ row: 0, column: 1 }, pointSet.from([{ row: 0, column: 2 }])],
      ])
    );
  });
  test("add existing edge", () => {
    const graph = PointGraph.from([
      [{ row: 0, column: 0 }, pointSet.from([{ row: 0, column: 1 }])],
    ]);
    expect(
      graph.set({ row: 0, column: 0 }, pointSet.from([{ row: 0, column: 1 }]))
    ).toEqual(graph);
  });
});

describe("PointGraph.getBackwards", () => {
  test("backwards get single edge", () => {
    const graph = PointGraph.from([
      [{ row: 0, column: 0 }, pointSet.from([{ row: 0, column: 1 }])],
    ]);
    expect(graph.getBackwards({ row: 0, column: 1 })).toEqual(
      pointSet.from([{ row: 0, column: 0 }])
    );
  });
  test("get backwards from non-existent point", () => {
    const graph = PointGraph.from([
      [{ row: 0, column: 0 }, pointSet.from([{ row: 0, column: 1 }])],
    ]);
    expect(graph.getBackwards({ row: 0, column: 2 })).toEqual(
      pointSet.from([])
    );
  });
  test("get backwards from point with no incoming edges", () => {
    const graph = PointGraph.from([
      [{ row: 0, column: 0 }, pointSet.from([{ row: 0, column: 1 }])],
    ]);
    expect(graph.getBackwards({ row: 0, column: 0 })).toEqual(
      pointSet.from([])
    );
  });
  test("get backwards from point with multiple incoming edges", () => {
    const graph = PointGraph.from([
      [
        { row: 0, column: 0 },
        pointSet.from([
          { row: 0, column: 1 },
          { row: 1, column: 0 },
        ]),
      ],
      [
        { row: 1, column: 0 },
        pointSet.from([
          { row: 0, column: 1 },
          { row: 0, column: 2 },
        ]),
      ],
    ]);
    expect(graph.getBackwards({ row: 0, column: 1 })).toEqual(
      pointSet.from([
        { row: 0, column: 0 },
        { row: 1, column: 0 },
      ])
    );
  });
});

describe("PointGraph.traverseBFS", () => {
  test("traverseBFS with empty graph", () => {
    const graph = PointGraph.from([]);
    expect(Array.from(graph.traverseBFS())).toEqual([]);
  });
  test("traverseBFS with single point", () => {
    const graph = PointGraph.from([[{ row: 0, column: 0 }, pointSet.from([])]]);
    expect(Array.from(graph.traverseBFS())).toEqual([{ row: 0, column: 0 }]);
  });
});

test("no circular dependency", () => {
  const graph = PointGraph.from([
    [{ row: 0, column: 1 }, pointSet.from([{ row: 0, column: 0 }])],
    [{ row: 0, column: 2 }, pointSet.from([{ row: 0, column: 1 }])],
    [{ row: 0, column: 3 }, pointSet.from([{ row: 0, column: 2 }])],
    [{ row: 0, column: 4 }, pointSet.from([{ row: 0, column: 3 }])],
  ]);
  expect(graph.hasCircularDependency({ row: 0, column: 1 })).toBe(false);
});

test("simple circular dependency", () => {
  const graph = PointGraph.from([
    [{ row: 0, column: 1 }, pointSet.from([{ row: 0, column: 0 }])],
    [{ row: 0, column: 0 }, pointSet.from([{ row: 0, column: 1 }])],
  ]);
  expect(graph.hasCircularDependency({ row: 0, column: 0 })).toBe(true);
});

test("multiple circular dependencies", () => {
  const graph = PointGraph.from([
    [{ row: 0, column: 1 }, pointSet.from([{ row: 0, column: 0 }])],
    [{ row: 0, column: 2 }, pointSet.from([{ row: 0, column: 1 }])],
    [{ row: 0, column: 0 }, pointSet.from([{ row: 0, column: 2 }])],
  ]);
  expect(graph.hasCircularDependency({ row: 0, column: 0 })).toBe(true);
});

test("self-referential circular dependency", () => {
  const graph = PointGraph.from([
    [{ row: 0, column: 0 }, pointSet.from([{ row: 0, column: 0 }])],
  ]);
  expect(graph.hasCircularDependency({ row: 0, column: 0 })).toBe(true);
});
