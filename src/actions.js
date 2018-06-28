// @flow
import * as PointSet from "./point-set";
import * as PointMap from "./point-map";
import * as Matrix from "./matrix";
import * as Types from "./types";
import { isActive, setCell, updateData } from "./util";

type Action = <Cell>(
  state: Types.StoreState<Cell>,
  ...*
) => $Shape<Types.StoreState<Cell>>;

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
  data: Cell,
  bindings: Types.Point[]
): $Shape<Types.StoreState<Cell>> {
  return {
    mode: "edit",
    data: setCell(state, data),
    lastChanged: state.active,
    bindings: PointMap.set(
      state.active,
      PointSet.from(bindings),
      state.bindings
    )
  };
}

export function setCellDimensions(
  state: Types.StoreState<*>,
  point: Types.Point,
  dimensions: Types.Dimensions
) {
  const prevDimensions = PointMap.get(point, state.cellDimensions);
  if (
    prevDimensions &&
    prevDimensions.width === dimensions.width &&
    prevDimensions.height === dimensions.height &&
    prevDimensions.top === dimensions.top &&
    prevDimensions.left === dimensions.left
  ) {
    return null;
  }
  return {
    cellDimensions: PointMap.set(point, dimensions, state.cellDimensions)
  };
}

export const copy = (state: Types.StoreState<*>) => ({
  copied: PointSet.reduce(
    (acc, point) =>
      PointMap.set(point, Matrix.get(point.row, point.column, state.data), acc),
    state.selected,
    PointMap.from([])
  ),
  cut: false,
  hasPasted: false
});

export const cut = (state: Types.StoreState<*>) => ({
  ...copy(state),
  cut: true
});

export const paste = (state: Types.StoreState<*>) => {
  const minPoint = PointSet.min(state.copied);

  type Accumulator = {|
    data: typeof state.data,
    selected: typeof state.selected
  |};

  const { data, selected } = PointMap.reduce(
    (acc: Accumulator, value, { row, column }): Accumulator => {
      if (!state.active) {
        return acc;
      }

      const nextRow = row - minPoint.row + state.active.row;
      const nextColumn = column - minPoint.column + state.active.column;

      const nextData = state.cut
        ? Matrix.unset(row, column, acc.data)
        : acc.data;

      if (!Matrix.has(nextRow, nextColumn, state.data)) {
        return { data: nextData, selected: acc.selected };
      }

      return {
        data: Matrix.set(nextRow, nextColumn, value, nextData),
        selected: PointSet.add(acc.selected, {
          row: nextRow,
          column: nextColumn
        })
      };
    },
    state.copied,
    { data: state.data, selected: PointSet.from([]) }
  );
  return {
    data,
    selected,
    cut: false,
    hasPasted: true,
    mode: "view"
  };
};

export const edit = () => ({
  mode: "edit"
});

export const view = () => ({
  mode: "view"
});

export const unfocus = (state: Types.StoreState<*>) => {
  if (!state.active) {
    return null;
  }
  return {
    data: PointSet.reduce(
      (acc, point) =>
        updateData(acc, {
          ...point,
          data: undefined
        }),
      state.selected,
      state.data
    )
  };
};

export type KeyDownHandler<Cell> = (
  state: Types.StoreState<Cell>,
  event: SyntheticKeyboardEvent<*>
) => $Shape<Types.StoreState<Cell>>;

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
  Backspace: unfocus
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

export function setDragging<T>(
  state: Types.StoreState<T>,
  dragging: boolean
): Types.StoreState<T> {
  return { ...state, dragging };
}
