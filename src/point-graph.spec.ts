import * as pointMap from "./point-map";
import * as pointSet from "./point-set";
import * as pointGraph from "./point-graph";

const EMPTY = pointGraph.from([]);

describe("PointGraph.from", () => {
  test("empty", () => {
    const graph = pointGraph.from([]);
    expect(graph).toEqual({
      backward: pointMap.from([]),
      forward: pointMap.from([]),
    });
  });
  test("single edge", () => {
    const graph = pointGraph.from([
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
    const graph = pointGraph.from([
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
      pointGraph.set(
        { row: 0, column: 0 },
        pointSet.from([{ row: 0, column: 1 }]),
        EMPTY
      )
    ).toEqual(
      pointGraph.from([
        [{ row: 0, column: 0 }, pointSet.from([{ row: 0, column: 1 }])],
      ])
    );
  });
  test("add two edges to empty", () => {
    expect(
      pointGraph.set(
        { row: 0, column: 0 },
        pointSet.from([
          { row: 0, column: 1 },
          { row: 0, column: 2 },
        ]),
        EMPTY
      )
    ).toEqual(
      pointGraph.from([
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
    const graph = pointGraph.from([
      [{ row: 0, column: 0 }, pointSet.from([{ row: 0, column: 1 }])],
    ]);
    expect(
      pointGraph.set({ row: 0, column: 0 }, pointSet.from([]), graph)
    ).toEqual(pointGraph.from([]));
  });
  test("remove and add single edges", () => {
    const graph = pointGraph.from([
      [{ row: 0, column: 0 }, pointSet.from([{ row: 0, column: 1 }])],
    ]);
    expect(
      pointGraph.set(
        { row: 0, column: 0 },
        pointSet.from([{ row: 0, column: 2 }]),
        graph
      )
    ).toEqual(
      pointGraph.from([
        [{ row: 0, column: 0 }, pointSet.from([{ row: 0, column: 2 }])],
      ])
    );
  });
  test("add and remove multiple edges", () => {
    let graph = EMPTY;
    graph = pointGraph.set(
      { row: 0, column: 0 },
      pointSet.from([
        { row: 0, column: 1 },
        { row: 0, column: 2 },
      ]),
      graph
    );
    graph = pointGraph.set(
      { row: 0, column: 1 },
      pointSet.from([{ row: 0, column: 2 }]),
      graph
    );
    expect(graph).toEqual(
      pointGraph.from([
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
    graph = pointGraph.set({ row: 0, column: 0 }, pointSet.from([]), graph);
    expect(graph).toEqual(
      pointGraph.from([
        [{ row: 0, column: 1 }, pointSet.from([{ row: 0, column: 2 }])],
      ])
    );
  });
  test("add existing edge", () => {
    const graph = pointGraph.from([
      [{ row: 0, column: 0 }, pointSet.from([{ row: 0, column: 1 }])],
    ]);
    expect(
      pointGraph.set(
        { row: 0, column: 0 },
        pointSet.from([{ row: 0, column: 1 }]),
        graph
      )
    ).toEqual(graph);
  });
});

describe("PointGraph.getBackwards", () => {
  test("backwards get single edge", () => {
    const graph = pointGraph.from([
      [{ row: 0, column: 0 }, pointSet.from([{ row: 0, column: 1 }])],
    ]);
    expect(pointGraph.getBackwards({ row: 0, column: 1 }, graph)).toEqual(
      pointSet.from([{ row: 0, column: 0 }])
    );
  });
  test("get backwards from non-existent point", () => {
    const graph = pointGraph.from([
      [{ row: 0, column: 0 }, pointSet.from([{ row: 0, column: 1 }])],
    ]);
    expect(pointGraph.getBackwards({ row: 0, column: 2 }, graph)).toEqual(
      pointSet.from([])
    );
  });
  test("get backwards from point with no incoming edges", () => {
    const graph = pointGraph.from([
      [{ row: 0, column: 0 }, pointSet.from([{ row: 0, column: 1 }])],
    ]);
    expect(pointGraph.getBackwards({ row: 0, column: 0 }, graph)).toEqual(
      pointSet.from([])
    );
  });
  test("get backwards from point with multiple incoming edges", () => {
    const graph = pointGraph.from([
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
    expect(pointGraph.getBackwards({ row: 0, column: 1 }, graph)).toEqual(
      pointSet.from([
        { row: 0, column: 0 },
        { row: 1, column: 0 },
      ])
    );
  });
});

describe("PointGraph.traverseBFS", () => {
  test("traverseBFS with empty graph", () => {
    const graph = pointGraph.from([]);
    expect(Array.from(pointGraph.traverseBFS(graph))).toEqual([]);
  });
  test("traverseBFS with single point", () => {
    const graph = pointGraph.from([[{ row: 0, column: 0 }, pointSet.from([])]]);
    expect(Array.from(pointGraph.traverseBFS(graph))).toEqual([
      { row: 0, column: 0 },
    ]);
  });
});

test("no circular dependency", () => {
  const graph = pointGraph.from([
    [{ row: 0, column: 1 }, pointSet.from([{ row: 0, column: 0 }])],
    [{ row: 0, column: 2 }, pointSet.from([{ row: 0, column: 1 }])],
    [{ row: 0, column: 3 }, pointSet.from([{ row: 0, column: 2 }])],
    [{ row: 0, column: 4 }, pointSet.from([{ row: 0, column: 3 }])],
  ]);
  expect(pointGraph.hasCircularDependency(graph, { row: 0, column: 1 })).toBe(
    false
  );
});

test("simple circular dependency", () => {
  const graph = pointGraph.from([
    [{ row: 0, column: 1 }, pointSet.from([{ row: 0, column: 0 }])],
    [{ row: 0, column: 0 }, pointSet.from([{ row: 0, column: 1 }])],
  ]);
  expect(pointGraph.hasCircularDependency(graph, { row: 0, column: 0 })).toBe(
    true
  );
});

test("multiple circular dependencies", () => {
  const graph = pointGraph.from([
    [{ row: 0, column: 1 }, pointSet.from([{ row: 0, column: 0 }])],
    [{ row: 0, column: 2 }, pointSet.from([{ row: 0, column: 1 }])],
    [{ row: 0, column: 0 }, pointSet.from([{ row: 0, column: 2 }])],
  ]);
  expect(pointGraph.hasCircularDependency(graph, { row: 0, column: 0 })).toBe(
    true
  );
});

test("self-referential circular dependency", () => {
  const graph = pointGraph.from([
    [{ row: 0, column: 0 }, pointSet.from([{ row: 0, column: 0 }])],
  ]);
  expect(pointGraph.hasCircularDependency(graph, { row: 0, column: 0 })).toBe(
    true
  );
});
