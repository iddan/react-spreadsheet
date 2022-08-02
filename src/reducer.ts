import * as PointSet from "./point-set";
import * as PointMap from "./point-map";
import * as PointRange from "./point-range";
import * as Matrix from "./matrix";
import * as Types from "./types";
import * as Point from "./point";
import * as Selection from "./selection";
import { isActive } from "./util";
import { createReducer } from "@reduxjs/toolkit";
import * as Actions from "./actions";

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

const reducer = createReducer(INITIAL_STATE, (builder) => {
  builder.addCase(Actions.setData, (state, action) => {
    const { data } = action.payload;
    const nextActive =
      state.active && Matrix.has(state.active, data) ? state.active : null;
    const nextSelected = Selection.normalize(state.selected, data);
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
  builder.addCase(Actions.selectEntireTable, (state) => {
    return {
      ...state,
      selected: Selection.createEntireTable(),
      active: Point.ORIGIN,
      mode: "view",
    };
  });
  builder.addCase(Actions.selectEntireColumn, (state, action) => {
    const { column, extend } = action.payload;
    const { active } = state;

    return {
      ...state,
      selected:
        extend && active
          ? Selection.createEntireColumns(active.column, column)
          : Selection.createEntireColumns(column, column),
      active: extend && active ? active : { ...Point.ORIGIN, column },
      mode: "view",
    };
  });
  builder.addCase(Actions.selectEntireRow, (state, action) => {
    const { row, extend } = action.payload;
    const { active } = state;

    return {
      ...state,
      selected:
        extend && active
          ? Selection.createEntireRows(active.row, row)
          : Selection.createEntireRows(row, row),
      active: extend && active ? active : { ...Point.ORIGIN, row },
      mode: "view",
    };
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
    const { active, data: cellData, getBindingsForCell } = action.payload;
    const bindings = getBindingsForCell(cellData, state.data);
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
    const requiredSize: Matrix.Size = {
      rows: active.row + copiedSize.rows,
      columns: active.column + copiedSize.columns,
    };
    const paddedData = Matrix.pad(state.data, requiredSize);

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
  builder.addCase(Actions.edit, edit);
  builder.addCase(Actions.view, view);
  builder.addCase(Actions.clear, clear);
  builder.addCase(Actions.blur, blur);
  builder.addCase(Actions.keyPress, (state, action) => {
    const { event } = action.payload;
    if (isActiveReadOnly(state) || event.metaKey) {
      return;
    }
    if (state.mode === "view" && state.active) {
      return edit(state);
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
      const selectedPoints = Selection.getPoints(state.selected, state.data);
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

export default reducer;

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

  const canClearCell = (cell: Types.CellBase | undefined) =>
    cell && !cell.readOnly;
  const clearCell = (cell: Types.CellBase | undefined) => {
    if (!canClearCell(cell)) {
      return cell;
    }
    return Object.assign({}, cell, { value: undefined });
  };

  const selectedPoints = Selection.getPoints(state.selected, state.data);

  const changes = selectedPoints.map((point) => {
    const cell = Matrix.get(point, state.data);
    return {
      ...state,
      prevCell: cell || null,
      nextCell: clearCell(cell) || null,
    };
  });

  const newData = selectedPoints.reduce((acc, point) => {
    const cell = Matrix.get(point, acc);
    return Matrix.set(point, clearCell(cell), acc);
  }, state.data);

  return {
    ...state,
    data: newData,
    ...commit(changes),
  };
}

function blur(state: Types.StoreState): Types.StoreState {
  return { ...state, active: null, selected: null };
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
  Delete: clear,
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

const shiftKeyDownHandlers: KeyDownHandlers = {
  ArrowUp: (state) => ({
    ...state,
    selected: Selection.modifyEdge(
      state.selected,
      state.active,
      state.data,
      Selection.Direction.Top
    ),
  }),
  ArrowDown: (state) => ({
    ...state,
    selected: Selection.modifyEdge(
      state.selected,
      state.active,
      state.data,
      Selection.Direction.Bottom
    ),
  }),
  ArrowLeft: (state) => ({
    ...state,
    selected: Selection.modifyEdge(
      state.selected,
      state.active,
      state.data,
      Selection.Direction.Left
    ),
  }),
  ArrowRight: (state) => ({
    ...state,
    selected: Selection.modifyEdge(
      state.selected,
      state.active,
      state.data,
      Selection.Direction.Right
    ),
  }),
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
export function hasKeyDownHandler(
  state: Types.StoreState,
  event: React.KeyboardEvent
): boolean {
  return getKeyDownHandler(state, event) !== undefined;
}

/** Returns whether the active cell is read only */
export function isActiveReadOnly(state: Types.StoreState): boolean {
  const activeCell = getActive(state);
  return Boolean(activeCell?.readOnly);
}

/** Gets active cell from given state */
export function getActive<Cell extends Types.CellBase>(
  state: Types.StoreState<Cell>
): Cell | null {
  const activeCell = state.active && Matrix.get(state.active, state.data);
  return activeCell || null;
}
