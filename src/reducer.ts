import * as PointSet from "./point-set";
import * as PointMap from "./point-map";
import * as PointRange from "./point-range";
import * as Matrix from "./matrix";
import * as Types from "./types";
import * as Point from "./point";
import { isActive, normalizeSelected } from "./util";
import { createReducer } from "@reduxjs/toolkit";
import * as Actions from "./actions";

enum Direction {
  Left = "Left",
  Right = "Right",
  Top = "Top",
  Down = "Down",
}

export const INITIAL_STATE: Types.StoreState = {
  active: null,
  mode: "view",
  rowDimensions: {},
  columnDimensions: {},
  lastChanged: null,
  hasPasted: false,
  cut: false,
  dragging: false,
  data: [],
  selected: null,
  copied: PointMap.from([]),
  bindings: PointMap.from([]),
  lastCommit: null,
};

export const reducer = createReducer(INITIAL_STATE, (builder) => {
  builder.addCase(Actions.setData, (state, action) => {
    const { data } = action.payload;
    const nextActive =
      state.active && Matrix.has(state.active, data) ? state.active : null;
    const nextSelected = normalizeSelected(state.selected, data);
    const nextBindings = PointMap.map(
      (bindings) =>
        PointSet.filter((point) => Matrix.has(point, data), bindings),
      PointMap.filter((_, point) => Matrix.has(point, data), state.bindings)
    );
    return {
      ...state,
      data,
      active: nextActive,
      selected: nextSelected,
      bindings: nextBindings,
    };
  });
  builder.addCase(Actions.select, (state, action) => {
    const { point } = action.payload;
    if (state.active && !isActive(state.active, point)) {
      return {
        ...state,
        selected: PointRange.create(point, state.active),
        mode: "view",
      };
    }
  });
  builder.addCase(Actions.activate, (state, action) => {
    const { point } = action.payload;
    return {
      ...state,
      selected: PointRange.create(point, point),
      active: point,
      mode: isActive(state.active, point) ? "edit" : "view",
    };
  });
  builder.addCase(Actions.setCellData, (state, action) => {
    const { active, data: cellData, bindings } = action.payload;
    if (isActiveReadOnly(state)) {
      return;
    }
    return {
      ...state,
      mode: "edit",
      data: Matrix.set(active, cellData, state.data),
      lastChanged: active,
      bindings: PointMap.set(active, PointSet.from(bindings), state.bindings),
    };
  });
  builder.addCase(Actions.setCellDimensions, (state, action) => {
    const { point, dimensions } = action.payload;
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
      return;
    }
    return {
      ...state,
      rowDimensions: {
        ...state.rowDimensions,
        [point.row]: { top: dimensions.top, height: dimensions.height },
      },
      columnDimensions: {
        ...state.columnDimensions,
        [point.column]: { left: dimensions.left, width: dimensions.width },
      },
    };
  });
  builder.addCase(Actions.paste, (state, action) => {
    const { data: text } = action.payload;
    const { active } = state;
    if (!active) {
      return;
    }
    const copiedMatrix = Matrix.split(text, (value) => ({ value }));
    const copied = PointMap.fromMatrix<any>(copiedMatrix);

    const minPoint = PointSet.min(copied);

    type Accumulator = {
      data: Types.StoreState["data"];
      commit: Types.StoreState["lastCommit"];
    };

    const copiedSize = Matrix.getSize(copiedMatrix);
    const requiredRows = active.row + copiedSize.rows;
    const paddedData = Matrix.padRows(state.data, requiredRows);

    const { data, commit } = PointMap.reduce<Accumulator, Types.CellBase>(
      (acc, value, point) => {
        let commit = acc.commit || [];
        const nextPoint: Point.Point = {
          row: point.row - minPoint.row + active.row,
          column: point.column - minPoint.column + active.column,
        };

        const nextData = state.cut ? Matrix.unset(point, acc.data) : acc.data;

        if (state.cut) {
          commit = [...commit, { prevCell: value, nextCell: null }];
        }

        if (!Matrix.has(nextPoint, paddedData)) {
          return { data: nextData, commit };
        }

        const currentValue = Matrix.get(nextPoint, nextData) || null;

        commit = [
          ...commit,
          {
            prevCell: currentValue,
            nextCell: value,
          },
        ];

        return {
          data: Matrix.set(nextPoint, { ...currentValue, ...value }, nextData),
          commit,
        };
      },
      copied,
      { data: paddedData, commit: [] }
    );
    return {
      ...state,
      data,
      selected: PointRange.create(active, {
        row: active.row + copiedSize.rows - 1,
        column: active.column + copiedSize.columns - 1,
      }),
      cut: false,
      hasPasted: true,
      mode: "view",
      lastCommit: commit,
    };
  });
  builder.addCase(Actions.edit, (state) => {
    if (isActiveReadOnly(state)) {
      return;
    }
    return { ...state, mode: "edit" };
  });
  builder.addCase(Actions.view, (state) => {
    return { ...state, mode: "view" };
  });
  builder.addCase(Actions.clear, (state) => {
    if (!state.active) {
      return;
    }
    const selectedPoints = state.selected
      ? Array.from(PointRange.iterate(state.selected))
      : [];
    const changes = selectedPoints.map((point) => {
      const cell = Matrix.get(point, state.data);
      return {
        ...state,
        prevCell: cell || null,
        nextCell: null,
      };
    });
    return {
      ...state,
      data: selectedPoints.reduce(
        (acc, point) => Matrix.set(point, undefined, acc),
        state.data
      ),
      ...commit(changes),
    };
  });
  builder.addCase(Actions.blur, (state) => {
    return { ...state, active: null };
  });
  builder.addCase(Actions.keyPress, (state, action) => {
    const { event } = action.payload;
    if (isActiveReadOnly(state) || event.metaKey) {
      return;
    }
    if (state.mode === "view" && state.active) {
      return { ...state, mode: "edit" };
    }
    return;
  });
  builder.addCase(Actions.keyDown, (state, action) => {
    const { event } = action.payload;
    const handler = getKeyDownHandler(state, event);
    if (handler) {
      return { ...state, ...handler(state, event) };
    }
    return;
  });
  builder.addCase(Actions.dragStart, (state, action) => {
    return { ...state, dragging: true };
  });
  builder.addCase(Actions.dragEnd, (state, action) => {
    return { ...state, dragging: false };
  });
  builder.addCase(Actions.commit, (state, action) => {
    const { changes } = action.payload;
    return { ...state, ...commit(changes) };
  });
  builder.addMatcher(
    (action) =>
      action.type === Actions.copy.type || action.type === Actions.cut.type,
    (state, action) => {
      const selectedPoints = state.selected
        ? Array.from(PointRange.iterate(state.selected))
        : [];
      return {
        ...state,
        copied: selectedPoints.reduce((acc, point) => {
          const cell = Matrix.get(point, state.data);
          return cell === undefined ? acc : PointMap.set(point, cell, acc);
        }, PointMap.from<Types.CellBase>([])),
        cut: action.type === Actions.cut.type,
        hasPasted: false,
      };
    }
  );
});

// Shared reducers

function edit(state: Types.StoreState): Types.StoreState | void {
  if (isActiveReadOnly(state)) {
    return;
  }
  return { ...state, mode: "edit" };
}

function clear(state: Types.StoreState): Types.StoreState | void {
  if (!state.active) {
    return;
  }
  const selectedPoints = state.selected
    ? Array.from(PointRange.iterate(state.selected))
    : [];
  const changes = selectedPoints.map((point) => {
    const cell = Matrix.get(point, state.data);
    return {
      ...state,
      prevCell: cell || null,
      nextCell: null,
    };
  });
  return {
    ...state,
    data: selectedPoints.reduce(
      (acc, point) => Matrix.set(point, undefined, acc),
      state.data
    ),
    ...commit(changes),
  };
}

function blur(state: Types.StoreState): Types.StoreState {
  return { ...state, active: null };
}

function view(state: Types.StoreState): Types.StoreState {
  return { ...state, mode: "view" };
}

function commit(changes: Types.CommitChanges): Partial<Types.StoreState> {
  return { lastCommit: changes };
}

// Utility

export const go =
  (rowDelta: number, columnDelta: number): KeyDownHandler =>
  (state) => {
    if (!state.active) {
      return;
    }
    const nextActive = {
      row: state.active.row + rowDelta,
      column: state.active.column + columnDelta,
    };
    if (!Matrix.has(nextActive, state.data)) {
      return { ...state, mode: "view" };
    }
    return {
      ...state,
      active: nextActive,
      selected: PointRange.create(nextActive, nextActive),
      mode: "view",
    };
  };

// Key Bindings

export type KeyDownHandler = (
  state: Types.StoreState,
  event: React.KeyboardEvent
) => Types.StoreState | void;

type KeyDownHandlers = {
  [K in string]: KeyDownHandler;
};

const keyDownHandlers: KeyDownHandlers = {
  ArrowUp: go(-1, 0),
  ArrowDown: go(+1, 0),
  ArrowLeft: go(0, -1),
  ArrowRight: go(0, +1),
  Tab: go(0, +1),
  Enter: edit,
  Backspace: clear,
  Escape: blur,
};

const editKeyDownHandlers: KeyDownHandlers = {
  Escape: view,
  Tab: keyDownHandlers.Tab,
  Enter: keyDownHandlers.ArrowDown,
};

const editShiftKeyDownHandlers: KeyDownHandlers = {
  Tab: go(0, -1),
};

export const modifyEdge =
  (edge: Direction) =>
  (state: Types.StoreState): Types.StoreState | void => {
    const { active, selected } = state;

    if (!active || !selected) {
      return;
    }

    const field =
      edge === Direction.Left || edge === Direction.Right ? "column" : "row";

    const key =
      edge === Direction.Left || edge === Direction.Top ? "start" : "end";
    const delta = key === "start" ? -1 : 1;

    const edgeOffsets = PointRange.has(selected, {
      ...active,
      [field]: active[field] + delta * -1,
    });

    const keyToModify = edgeOffsets ? (key === "start" ? "end" : "start") : key;

    const nextSelected: PointRange.PointRange = {
      ...selected,
      [keyToModify]: {
        ...selected[keyToModify],
        [field]: selected[keyToModify][field] + delta,
      },
    };

    return {
      ...state,
      selected: normalizeSelected(nextSelected, state.data),
    };
  };

const shiftKeyDownHandlers: KeyDownHandlers = {
  ArrowUp: modifyEdge(Direction.Top),
  ArrowDown: modifyEdge(Direction.Down),
  ArrowLeft: modifyEdge(Direction.Left),
  ArrowRight: modifyEdge(Direction.Right),
  Tab: go(0, -1),
};

const shiftMetaKeyDownHandlers: KeyDownHandlers = {};
const metaKeyDownHandlers: KeyDownHandlers = {};

export function getKeyDownHandler(
  state: Types.StoreState,
  event: React.KeyboardEvent
): KeyDownHandler | undefined {
  const { key } = event;
  let handlers;
  // Order matters
  if (state.mode === "edit") {
    if (event.shiftKey) {
      handlers = editShiftKeyDownHandlers;
    } else {
      handlers = editKeyDownHandlers;
    }
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
}

/** Returns whether the reducer has a handler for the given keydown event */
export function hasKeyDownHandler(state: Types.StoreState, event: React.KeyboardEvent): boolean {
  return getKeyDownHandler(state, event) !== undefined;
}

function getActive<Cell extends Types.CellBase>(
  state: Types.StoreState<Cell>
): Cell | null {
  const activeCell = state.active && Matrix.get(state.active, state.data);
  return activeCell || null;
}

const isActiveReadOnly = (state: Types.StoreState<Types.CellBase>): boolean => {
  const activeCell = getActive(state);
  return Boolean(activeCell && activeCell.readOnly);
};
