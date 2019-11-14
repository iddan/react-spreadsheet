import * as PointSet from "./point-set";
import * as PointMap from "./point-map";
import * as Matrix from "./matrix";
import * as Types from "./types";
import { isActive, setCell, updateData } from "./util";
import * as React from "react";

type Action = <Cell>(
  state: Types.IStoreState<Cell>
) => Partial<Types.IStoreState<Cell>> | null;

export const select: Action = (state: any, cellPointer: Types.IPoint) => {
  if (state.active && !isActive(state.active, cellPointer)) {
    return {
      selected: PointSet.from(
        Matrix.inclusiveRange(
          { row: cellPointer.row, column: cellPointer.column },
          { row: state.active.row, column: state.active.column }
        )
      ),
      mode: "view"
    };
  }
  return null;
};

export const activate = (state: any, cellPointer: Types.IPoint) => ({
  selected: PointSet.from([cellPointer]),
  active: cellPointer,
  mode: isActive(state.active, cellPointer) ? "edit" : "view"
});

export function setData<Cell>(
  state: Types.IStoreState<Cell>,
  active: Types.IPoint,
  data: Cell,
  bindings: Types.IPoint[]
): Partial<Types.IStoreState<Cell>> {
  return {
    mode: "edit",
    data: setCell(state, active, data),
    lastChanged: active,
    bindings: PointMap.set(active, PointSet.from(bindings), state.bindings)
  };
}

export function setCellDimensions(
  state: Types.IStoreState<any>,
  point: Types.IPoint,
  dimensions: Types.IDimensions
): Partial<Types.IStoreState<any>> | null {
  const prevRowDimensions = state.rowDimensions[point.row];
  const prevColumnDimensions = state.columnDimensions[point.column];
  if (
    prevRowDimensions &&
    prevColumnDimensions &&
    prevRowDimensions.top === dimensions.top &&
    prevRowDimensions.height === dimensions.height &&
    prevColumnDimensions.left === dimensions.left &&
    prevColumnDimensions.width === dimensions.width
  ) {
    return null;
  }
  return {
    rowDimensions: {
      ...state.rowDimensions,
      [point.row]: { top: dimensions.top, height: dimensions.height }
    },
    columnDimensions: {
      ...state.columnDimensions,
      [point.column]: { left: dimensions.left, width: dimensions.width }
    }
  };
}

export function copy<T>(state: Types.IStoreState<T>) {
  return {
    copied: PointSet.reduce(
      (acc, point) =>
        PointMap.set<T>(
          point,
          Matrix.get<T>(point.row, point.column, state.data),
          acc
        ),
      state.selected,
      PointMap.from<T>([])
    ),
    cut: false,
    hasPasted: false
  };
}

export const cut = (state: Types.IStoreState<any>) => ({
  ...copy(state),
  cut: true
});

export function paste<Cell>(state: Types.IStoreState<Cell>) {
  if (PointSet.isEmpty(state.copied)) {
    return null;
  }
  const minPoint = PointSet.min(state.copied);

  type Accumulator = {
    data: Types.IStoreState<Cell>["data"];
    selected: Types.IStoreState<Cell>["selected"];
    commit: Types.IStoreState<Cell>["lastCommit"];
  };

  const { data, selected, commit } = PointMap.reduce(
    (acc: Accumulator, value, { row, column }): any => {
      if (!state.active) {
        return acc;
      }

      let commit: Types.IStoreState<Cell>["lastCommit"] = acc.commit || [];
      const nextRow = row - minPoint.row + state.active.row;
      const nextColumn = column - minPoint.column + state.active.column;

      const nextData = state.cut
        ? Matrix.unset(row, column, acc.data)
        : acc.data;

      if (state.cut && commit) {
        commit = [...commit, { prevCell: value, nextCell: null }];
      }

      if (!Matrix.has(nextRow, nextColumn, state.data)) {
        return { data: nextData, selected: acc.selected, commit };
      }

      if (commit) {
        commit = [
          ...commit,
          {
            prevCell: Matrix.get(nextRow, nextColumn, nextData),
            nextCell: value
          }
        ];
      }

      return {
        data: Matrix.set(nextRow, nextColumn, value, nextData),
        selected: PointSet.add(acc.selected, {
          row: nextRow,
          column: nextColumn
        }),
        commit
      };
    },
    state.copied,
    { data: state.data, selected: PointSet.from([]), commit: [] }
  );
  return {
    data,
    selected,
    cut: false,
    hasPasted: true,
    mode: "view",
    lastCommit: commit
  };
}

export const edit = () => ({
  mode: "edit"
});

export const view = () => ({
  mode: "view"
});

export const clear = (state: Types.IStoreState<any>) => {
  if (!state.active) {
    return null;
  }

  const { row, column } = state.active;
  const cell = Matrix.get(row, column, state.data);
  return {
    data: PointSet.reduce(
      (acc, point) =>
        updateData(acc, {
          ...point,
          data: { ...cell, value: "" }
        }),
      state.selected,
      state.data
    ),
    ...commit(
      state,
      PointSet.toArray(state.selected).map(point => {
        const cell = Matrix.get(point.row, point.column, state.data);
        return {
          prevCell: cell,
          nextCell: { ...cell, value: "" }
        };
      })
    )
  };
};

export type KeyDownHandler<Cell> = (
  state: Types.IStoreState<Cell>,
  event: KeyboardEvent
) => Partial<Types.IStoreState<Cell>> | null;

export const go = (
  rowDelta: number,
  columnDelta: number
): KeyDownHandler<any> => (state, _) => {
  if (!state.active) {
    return null;
  }
  const nextActive = {
    row: state.active.row + rowDelta,
    column: state.active.column + columnDelta
  };
  if (!Matrix.has(nextActive.row, nextActive.column, state.data)) {
    return { mode: "view" };
  }
  return {
    active: nextActive,
    selected: PointSet.from([nextActive]),
    mode: "view"
  };
};

export const modifyEdge = (field: keyof Types.IPoint, delta: number) => (
  state: Types.IStoreState<any>
) => {
  if (!state.active) {
    return null;
  }

  const edgeOffsets = PointSet.has(state.selected, {
    ...state.active,
    [field]: state.active[field] + delta * -1
  });

  const nextSelected = edgeOffsets
    ? PointSet.shrinkEdge(state.selected, field, delta * -1)
    : PointSet.extendEdge(state.selected, field, delta);

  return {
    selected: PointSet.filter(
      point => Matrix.has(point.row, point.column, state.data),
      nextSelected
    )
  };
};

export const blur = () => ({
  active: null
});

// Key Bindings

type KeyDownHandlers<Cell> = {
  [eventType: string]: KeyDownHandler<Cell>;
};

/** @todo handle inactive state? */
const keyDownHandlers: KeyDownHandlers<any> = {
  ArrowUp: go(-1, 0),
  ArrowDown: go(+1, 0),
  ArrowLeft: go(0, -1),
  ArrowRight: go(0, +1),
  Tab: go(0, +1),
  Enter: edit,
  Backspace: clear,
  Escape: blur
};

const editKeyDownHandlers: KeyDownHandlers<any> = {
  Escape: view,
  Tab: keyDownHandlers.Tab,
  Enter: keyDownHandlers.ArrowDown
};

const shiftKeyDownHandlers: KeyDownHandlers<any> = {
  ArrowUp: modifyEdge("row", -1),
  ArrowDown: modifyEdge("row", 1),
  ArrowLeft: modifyEdge("column", -1),
  ArrowRight: modifyEdge("column", 1)
};

const shiftMetaKeyDownHandlers: KeyDownHandlers<any> = {};
const metaKeyDownHandlers: KeyDownHandlers<any> = {};

export function keyPress(state: Types.IStoreState<any>, _: KeyboardEvent) {
  if (state.mode === "view" && state.active) {
    return { mode: "edit" };
  }
  return null;
}

export const getKeyDownHandler = (
  state: Types.IStoreState<any>,
  event: React.KeyboardEvent<HTMLInputElement>
) => {
  const { key } = event;
  let handlers;
  // Order matters
  if (state.mode === "edit") {
    handlers = editKeyDownHandlers;
  } else if (event.shiftKey && event.metaKey) {
    handlers = shiftMetaKeyDownHandlers;
  } else if (event.shiftKey) {
    handlers = shiftKeyDownHandlers;
  } else if (event.metaKey) {
    handlers = metaKeyDownHandlers;
  } else {
    handlers = keyDownHandlers;
  }
  return handlers[key];
};

export function keyDown(state: Types.IStoreState<any>, event: KeyboardEvent) {
  const handler = getKeyDownHandler(state, event);
  if (handler) {
    return handler(state, event);
  }
  return null;
}

export function dragStart() {
  return { dragging: true };
}

export function dragEnd() {
  return { dragging: false };
}

export function commit<T>(
  _: Types.IStoreState<T>,
  changes: Array<{ prevCell: T | null; nextCell: T | null }>
) {
  return { lastCommit: changes };
}
