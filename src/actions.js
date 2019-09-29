// @flow
import * as PointSet from "./point-set";
import * as PointMap from "./point-map";
import * as Matrix from "./matrix";
import * as Types from "./types";
import { isActive, setCell, updateData } from "./util";

type Action = <Cell>(
  state: Types.StoreState<Cell>,
  ...*
) => $Shape<Types.StoreState<Cell>> | null;

export const select: Action = (state, cellPointer: Types.Point) => {
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

export const activate: Action = (state, cellPointer: Types.Point) => ({
  selected: PointSet.from([cellPointer]),
  active: cellPointer,
  mode: isActive(state.active, cellPointer) ? "edit" : "view"
});

export function setData<Cell>(
  state: Types.StoreState<Cell>,
  active: Types.Point,
  data: Cell,
  bindings: Types.Point[]
): $Shape<Types.StoreState<Cell>> {
  return {
    mode: "edit",
    data: setCell(state, active, data),
    lastChanged: active,
    bindings: PointMap.set(active, PointSet.from(bindings), state.bindings)
  };
}

export function setCellDimensions(
  state: Types.StoreState<*>,
  point: Types.Point,
  dimensions: Types.Dimensions
): $Shape<Types.StoreState<*>> | null {
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

export function copy<T>(state: Types.StoreState<T>) {
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

export const cut = (state: Types.StoreState<*>) => ({
  ...copy(state),
  cut: true
});

export function paste<Cell>(state: Types.StoreState<Cell>) {
  const minPoint = PointSet.min(state.copied);

  type Accumulator = {|
    data: $PropertyType<Types.StoreState<Cell>, "data">,
    selected: $PropertyType<Types.StoreState<Cell>, "selected">,
    commit: $PropertyType<Types.StoreState<Cell>, "lastCommit">
  |};

  const { data, selected, commit } = PointMap.reduce(
    (acc: Accumulator, value, { row, column }): Accumulator => {
      if (!state.active) {
        return acc;
      }

      let commit =
        acc.commit || ([]: $PropertyType<Types.StoreState<Cell>, "lastCommit">);
      const nextRow = row - minPoint.row + state.active.row;
      const nextColumn = column - minPoint.column + state.active.column;

      const nextData = state.cut
        ? Matrix.unset(row, column, acc.data)
        : acc.data;

      if (state.cut) {
        commit = [...commit, { prevCell: value, nextCell: undefined }];
      }

      if (!Matrix.has(nextRow, nextColumn, state.data)) {
        return { data: nextData, selected: acc.selected, commit };
      }

      commit = [
        ...commit,
        {
          prevCell: Matrix.get(nextRow, nextColumn, nextData),
          nextCell: value
        }
      ];

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

export const clear = (state: Types.StoreState<*>) => {
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
  state: Types.StoreState<Cell>,
  event: SyntheticKeyboardEvent<*>
) => $Shape<Types.StoreState<Cell>> | null;

export const go = (
  rowDelta: number,
  columnDelta: number
): KeyDownHandler<*> => (state, event) => {
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

export const modifyEdge = (field: $Keys<Types.Point>, delta: number) => (
  state: Types.StoreState<*>,
  event: *
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

export const blur = (state: Types.StoreState<*>) => ({
  active: null
});

// Key Bindings

type KeyDownHandlers<Cell> = {
  [eventType: string]: KeyDownHandler<Cell>
};

/** @todo handle inactive state? */
const keyDownHandlers: KeyDownHandlers<*> = {
  ArrowUp: go(-1, 0),
  ArrowDown: go(+1, 0),
  ArrowLeft: go(0, -1),
  ArrowRight: go(0, +1),
  Tab: go(0, +1),
  Enter: edit,
  Backspace: clear,
  Escape: blur
};

const editKeyDownHandlers: KeyDownHandlers<*> = {
  Escape: view,
  Tab: keyDownHandlers.Tab,
  Enter: keyDownHandlers.ArrowDown
};

const shiftKeyDownHandlers: KeyDownHandlers<*> = {
  ArrowUp: modifyEdge("row", -1),
  ArrowDown: modifyEdge("row", 1),
  ArrowLeft: modifyEdge("column", -1),
  ArrowRight: modifyEdge("column", 1)
};

export function keyPress(
  state: Types.StoreState<*>,
  event: SyntheticKeyboardEvent<HTMLElement>
) {
  if (state.mode === "view" && state.active) {
    return { mode: "edit" };
  }
  return null;
}

export const getKeyDownHandler = (
  state: Types.StoreState<*>,
  event: SyntheticKeyboardEvent<HTMLElement>
) => {
  const { key } = event;
  let handlers;
  // Order matters
  if (state.mode === "edit") {
    handlers = editKeyDownHandlers;
  } else if (event.shiftKey) {
    handlers = shiftKeyDownHandlers;
  } else {
    handlers = keyDownHandlers;
  }
  return handlers[key];
};

export function keyDown(
  state: Types.StoreState<*>,
  event: SyntheticKeyboardEvent<HTMLElement>
) {
  const handler = getKeyDownHandler(state, event);
  if (handler) {
    return handler(state, event);
  }
  return null;
}

export function dragStart<T>(state: Types.StoreState<T>) {
  return { dragging: true };
}

export function dragEnd<T>(state: Types.StoreState<T>) {
  return { dragging: false };
}

export function commit<T>(
  state: Types.StoreState<T>,
  changes: Array<{ prevCell: T | null, nextCell: T | null }>
) {
  return { lastCommit: changes };
}
