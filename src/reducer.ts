import * as PointSet from "./point-set";
import * as PointMap from "./point-map";
import * as PointRange from "./point-range";
import * as Matrix from "./matrix";
import * as Types from "./types";
import * as Point from "./point";
import * as Selection from "./selection";
import { isActive } from "./util";
import * as Actions from "./actions";
import { Model, updateCellValue } from "./engine";

export const INITIAL_STATE: Types.StoreState = {
  active: null,
  mode: "view",
  rowDimensions: {},
  columnDimensions: {},
  lastChanged: null,
  hasPasted: false,
  cut: false,
  dragging: false,
  model: new Model([]),
  selected: null,
  copied: PointMap.from([]),
  lastCommit: null,
  autoFilling: false,
};

export default function reducer(
  state: Types.StoreState,
  action: Actions.Action
): Types.StoreState {
  switch (action.type) {
    case Actions.SET_DATA: {
      const { data } = action.payload;
      const nextActive =
        state.active && Matrix.has(state.active, data) ? state.active : null;
      const nextSelected = Selection.normalize(state.selected, data);
      return {
        ...state,
        model: new Model(data),
        active: nextActive,
        selected: nextSelected,
      };
    }
    case Actions.SELECT_ENTIRE_ROW: {
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
    }
    case Actions.SELECT_ENTIRE_COLUMN: {
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
    }
    case Actions.SELECT_ENTIRE_TABLE: {
      return {
        ...state,
        selected: Selection.createEntireTable(),
        active: Point.ORIGIN,
        mode: "view",
      };
    }
    case Actions.SELECT: {
      const { point } = action.payload;
      if (state.active && !isActive(state.active, point)) {
        return {
          ...state,
          selected: PointRange.create(point, state.active),
          mode: "view",
        };
      }
      return state;
    }
    case Actions.ACTIVATE: {
      const { point } = action.payload;
      return {
        ...state,
        selected: PointRange.create(point, point),
        active: point,
        mode: isActive(state.active, point) ? "edit" : "view",
      };
    }
    case Actions.SET_CELL_DATA: {
      const { active, data: cellData } = action.payload;
      if (isActiveReadOnly(state)) {
        return state;
      }
      return {
        ...state,
        model: updateCellValue(state.model, active, cellData),
        lastChanged: active,
      };
    }
    case Actions.SET_CELL_DIMENSIONS: {
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
        return state;
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
    }
    case Actions.COPY:
    case Actions.CUT: {
      const selectedPoints = Selection.getPoints(
        state.selected,
        state.model.data
      );
      return {
        ...state,
        copied: selectedPoints.reduce((acc, point) => {
          const cell = Matrix.get(point, state.model.data);
          return cell === undefined ? acc : PointMap.set(point, cell, acc);
        }, PointMap.from<Types.CellBase>([])),
        cut: action.type === Actions.CUT,
        hasPasted: false,
      };
    }

    case Actions.PASTE: {
      const { data: text } = action.payload;
      const { active } = state;
      if (!active) {
        return state;
      }
      const copiedMatrix = Matrix.split(text, (value) => ({ value }));
      const copied = PointMap.fromMatrix<any>(copiedMatrix);

      const minPoint = PointSet.min(copied);

      type Accumulator = {
        data: Types.StoreState["model"]["data"];
        commit: Types.StoreState["lastCommit"];
      };

      const copiedSize = Matrix.getSize(copiedMatrix);
      const requiredSize: Matrix.Size = {
        rows: active.row + copiedSize.rows,
        columns: active.column + copiedSize.columns,
      };
      const paddedData = Matrix.pad(state.model.data, requiredSize);

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
            data: Matrix.set(
              nextPoint,
              { ...currentValue, ...value },
              nextData
            ),
            commit,
          };
        },
        copied,
        { data: paddedData, commit: [] }
      );
      return {
        ...state,
        model: new Model(data),
        selected: PointRange.create(active, {
          row: active.row + copiedSize.rows - 1,
          column: active.column + copiedSize.columns - 1,
        }),
        cut: false,
        hasPasted: true,
        mode: "view",
        lastCommit: commit,
      };
    }

    case Actions.EDIT: {
      return edit(state);
    }

    case Actions.VIEW: {
      return view(state);
    }

    case Actions.CLEAR: {
      return clear(state);
    }

    case Actions.BLUR: {
      return blur(state);
    }

    case Actions.KEY_PRESS: {
      const { event } = action.payload;
      if (isActiveReadOnly(state) || event.metaKey) {
        return state;
      }
      if (state.mode === "view" && state.active) {
        return edit(state);
      }
      return state;
    }

    case Actions.KEY_DOWN: {
      const { event } = action.payload;
      const handler = getKeyDownHandler(state, event);
      if (handler) {
        return { ...state, ...handler(state, event) };
      }
      return state;
    }

    case Actions.DRAG_START: {
      return { ...state, dragging: true };
    }

    case Actions.DRAG_END: {
      return { ...state, dragging: false };
    }

    case Actions.COMMIT: {
      const { changes } = action.payload;
      return { ...state, ...commit(changes) };
    }
    case Actions.AUTO_FILL_START: {
      return { ...state, autoFilling: true };
    }
    case Actions.AUTO_FILL_END: {
      const { active, selected } = state;

      const nextState = { ...state, autoFilling: false };

      if (!active || !PointRange.is(selected)) {
        return nextState;
      }

      const nextData = autoFill(nextState.model.data, selected, active);
      return nextData === nextState.model.data
        ? nextState
        : { ...nextState, model: new Model(nextData) };
    }
  }
}

// // Shared reducers

function edit(state: Types.StoreState): Types.StoreState {
  if (isActiveReadOnly(state)) {
    return state;
  }
  return { ...state, mode: "edit" };
}

function clear(state: Types.StoreState): Types.StoreState {
  if (!state.active) {
    return state;
  }

  const canClearCell = (cell: Types.CellBase | undefined) =>
    cell && !cell.readOnly;
  const clearCell = (cell: Types.CellBase | undefined) => {
    if (!canClearCell(cell)) {
      return cell;
    }
    return Object.assign({}, cell, { value: undefined });
  };

  const selectedPoints = Selection.getPoints(state.selected, state.model.data);

  const changes = selectedPoints.map((point) => {
    const cell = Matrix.get(point, state.model.data);
    return {
      ...state,
      prevCell: cell || null,
      nextCell: clearCell(cell) || null,
    };
  });

  const newData = selectedPoints.reduce((acc, point) => {
    const cell = Matrix.get(point, acc);
    return Matrix.set(point, clearCell(cell), acc);
  }, state.model.data);

  return {
    ...state,
    model: new Model(newData),
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
    if (!Matrix.has(nextActive, state.model.data)) {
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
      state.model.data,
      Selection.Direction.Top
    ),
  }),
  ArrowDown: (state) => ({
    ...state,
    selected: Selection.modifyEdge(
      state.selected,
      state.active,
      state.model.data,
      Selection.Direction.Bottom
    ),
  }),
  ArrowLeft: (state) => ({
    ...state,
    selected: Selection.modifyEdge(
      state.selected,
      state.active,
      state.model.data,
      Selection.Direction.Left
    ),
  }),
  ArrowRight: (state) => ({
    ...state,
    selected: Selection.modifyEdge(
      state.selected,
      state.active,
      state.model.data,
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
export function getActive(state: Types.StoreState): Types.CellBase | null {
  const activeCell = state.active && Matrix.get(state.active, state.model.data);
  return activeCell || null;
}

/** Autofill the given selected range in given data according to active */
export function autoFill<T extends Types.CellBase>(
  data: Matrix.Matrix<T>,
  selected: PointRange.PointRange,
  active: Point.Point
): Matrix.Matrix<T> {
  const activeCell = Matrix.get(active, data);
  if (!activeCell) {
    return data;
  }
  const nextPoint = getNextPoint(active, selected);
  if (!nextPoint) {
    return data;
  }
  const nextCell = Matrix.get(nextPoint, data);

  let nextData = data;
  let value = Number(activeCell.value);
  for (const point of PointRange.iterate(selected)) {
    const currentCell = Matrix.get(point, nextData);
    let updatedCell;
    // Increasing series
    if (Number(activeCell.value) + 1 === Number(nextCell?.value)) {
      updatedCell = { ...currentCell, value } as T;

      value++;
    }
    // Decreasing series
    else if (Number(activeCell.value) - 1 === Number(nextCell?.value)) {
      updatedCell = { ...currentCell, value } as T;
      value--;
    }
    // Same value
    else {
      updatedCell = { ...currentCell, value } as T;
    }
    nextData = Matrix.set(point, updatedCell, nextData);
  }
  return nextData;
}

/** Get the next point after active in range */
export function getNextPoint(
  active: Point.Point,
  range: PointRange.PointRange
): Point.Point | undefined {
  const { start, end } = range;
  const isHorizontal = start.row === end.row;
  const isVertical = start.column === end.column;
  if ((isHorizontal && isVertical) || (!isHorizontal && !isVertical)) {
    return undefined;
  }
  if (isHorizontal) {
    const isForward = active.column < end.column;
    const nextColumn = isForward ? active.column + 1 : active.column - 1;
    const nextPoint = { row: active.row, column: nextColumn };
    if (PointRange.has(range, nextPoint)) {
      return nextPoint;
    }
  }
  if (isVertical) {
    const isForward = active.row < end.row;
    const nextRow = isForward ? active.row + 1 : active.row - 1;
    const nextPoint = { row: nextRow, column: active.column };
    if (PointRange.has(range, nextPoint)) {
      return nextPoint;
    }
  }
}
