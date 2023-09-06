import { PointRange } from "./point-range";
import * as Matrix from "./matrix";
import * as Types from "./types";
import * as Point from "./point";
import {
  Selection,
  EmptySelection,
  RangeSelection,
  EntireColumnsSelection,
  EntireRowsSelection,
  EntireWorksheetSelection,
} from "./selection";
import { isActive } from "./util";
import * as Actions from "./actions";
import { Model, updateCellValue, createFormulaParser } from "./engine";

export const INITIAL_STATE: Types.StoreState = {
  active: null,
  mode: "view",
  rowDimensions: {},
  columnDimensions: {},
  lastChanged: null,
  hasPasted: false,
  cut: false,
  dragging: false,
  model: new Model(createFormulaParser, []),
  selected: new EmptySelection(),
  copied: null,
  lastCommit: null,
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
      const nextSelected = state.selected.normalizeTo(data);
      return {
        ...state,
        model: new Model(state.model.createFormulaParser, data),
        active: nextActive,
        selected: nextSelected,
      };
    }
    case Actions.SET_CREATE_FORMULA_PARSER: {
      const { createFormulaParser } = action.payload;
      return {
        ...state,
        model: new Model(createFormulaParser, state.model.data),
      };
    }
    case Actions.SELECT_ENTIRE_ROW: {
      const { row, extend } = action.payload;
      const { active } = state;

      return {
        ...state,
        selected:
          extend && active
            ? new EntireRowsSelection(active.row, row)
            : new EntireRowsSelection(row, row),
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
            ? new EntireColumnsSelection(active.column, column)
            : new EntireColumnsSelection(column, column),
        active: extend && active ? active : { ...Point.ORIGIN, column },
        mode: "view",
      };
    }
    case Actions.SELECT_ENTIRE_WORKSHEET: {
      return {
        ...state,
        selected: new EntireWorksheetSelection(),
        active: Point.ORIGIN,
        mode: "view",
      };
    }
    case Actions.SELECT: {
      const { point } = action.payload;
      if (state.active && !isActive(state.active, point)) {
        return {
          ...state,
          selected: new RangeSelection(new PointRange(point, state.active)),
          mode: "view",
        };
      }
      return state;
    }
    case Actions.ACTIVATE: {
      const { point } = action.payload;
      return {
        ...state,
        selected: new RangeSelection(new PointRange(point, point)),
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
      const selectedRange = state.selected.toRange(state.model.data);
      return {
        ...state,
        copied: selectedRange,
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
      const copied = Matrix.split(text, (value) => ({ value }));
      const copiedSize = Matrix.getSize(copied);

      const selectedRange = state.selected.toRange(state.model.data);
      if (selectedRange && copiedSize.rows === 1 && copiedSize.columns === 1) {
        const cell = Matrix.get({ row: 0, column: 0 }, copied);
        let newData =
          state.cut && state.copied
            ? Matrix.unset(state.copied.start, state.model.data)
            : state.model.data;
        const commit: Types.StoreState["lastCommit"] = [];
        for (const point of selectedRange || []) {
          const currentCell = Matrix.get(point, state.model.data);
          commit.push({
            prevCell: currentCell || null,
            nextCell: cell || null,
          });
          newData = Matrix.set(point, cell, newData);
        }

        return {
          ...state,
          model: new Model(createFormulaParser, newData),
          copied: null,
          cut: false,
          hasPasted: true,
          mode: "view",
          lastCommit: commit,
        };
      }

      const requiredSize: Matrix.Size = {
        rows: active.row + copiedSize.rows,
        columns: active.column + copiedSize.columns,
      };
      const paddedData = Matrix.pad(state.model.data, requiredSize);

      let acc: {
        data: Types.StoreState["model"]["data"];
        commit: Types.StoreState["lastCommit"];
      } = { data: paddedData, commit: [] };
      for (const [point, cell] of Matrix.entries(copied)) {
        let commit = acc.commit || [];
        const nextPoint: Point.Point = {
          row: point.row + active.row,
          column: point.column + active.column,
        };

        let nextData = acc.data;

        if (state.cut) {
          if (state.copied) {
            const prevPoint: Point.Point = {
              row: point.row + state.copied.start.row,
              column: point.column + state.copied.start.column,
            };
            nextData = Matrix.unset(prevPoint, acc.data);
          }

          commit = [...commit, { prevCell: cell || null, nextCell: null }];
        }

        if (!Matrix.has(nextPoint, paddedData)) {
          acc = { data: nextData, commit };
        }

        const currentCell = Matrix.get(nextPoint, nextData) || null;

        commit = [
          ...commit,
          {
            prevCell: currentCell,
            nextCell: cell || null,
          },
        ];

        acc.data = Matrix.set(
          nextPoint,
          { value: undefined, ...currentCell, ...cell },
          nextData
        );
        acc.commit = commit;
      }

      return {
        ...state,
        model: new Model(createFormulaParser, acc.data),
        selected: new RangeSelection(
          new PointRange(active, {
            row: active.row + copiedSize.rows - 1,
            column: active.column + copiedSize.columns - 1,
          })
        ),
        copied: null,
        cut: false,
        hasPasted: true,
        mode: "view",
        lastCommit: acc.commit,
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

    default:
      throw new Error("Unknown action");
  }
}

// const reducer = createReducer(INITIAL_STATE, (builder) => {
//   builder.addMatcher(
//     (action) =>
//       action.type === Actions.copy.type || action.type === Actions.cut.type,
//     (state, action) => {

//     }
//   );
// });

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

  const selectedRange = state.selected.toRange(state.model.data);

  const changes: Types.CommitChanges = [];
  let newData = state.model.data;

  for (const point of selectedRange || []) {
    const cell = Matrix.get(point, state.model.data);
    const clearedCell = clearCell(cell);
    changes.push({
      prevCell: cell || null,
      nextCell: clearedCell || null,
    });
    newData = Matrix.set(point, clearedCell, newData);
  }

  return {
    ...state,
    model: new Model(createFormulaParser, newData),
    ...commit(changes),
  };
}

function blur(state: Types.StoreState): Types.StoreState {
  return { ...state, active: null, selected: new EmptySelection() };
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
      selected: new RangeSelection(new PointRange(nextActive, nextActive)),
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

export enum Direction {
  Left = "Left",
  Right = "Right",
  Top = "Top",
  Bottom = "Bottom",
}

const shiftKeyDownHandlers: KeyDownHandlers = {
  ArrowUp: (state) => ({
    ...state,
    selected: modifyEdge(
      state.selected,
      state.active,
      state.model.data,
      Direction.Top
    ),
  }),
  ArrowDown: (state) => ({
    ...state,
    selected: modifyEdge(
      state.selected,
      state.active,
      state.model.data,
      Direction.Bottom
    ),
  }),
  ArrowLeft: (state) => ({
    ...state,
    selected: modifyEdge(
      state.selected,
      state.active,
      state.model.data,
      Direction.Left
    ),
  }),
  ArrowRight: (state) => ({
    ...state,
    selected: modifyEdge(
      state.selected,
      state.active,
      state.model.data,
      Direction.Right
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

/** Modify given edge according to given active point and data */
export function modifyEdge<T extends Selection>(
  selection: T,
  active: Point.Point | null,
  data: Matrix.Matrix<unknown>,
  direction: Direction
): T {
  if (!active) {
    return selection;
  }
  if (selection instanceof RangeSelection) {
    const nextSelection = modifyRangeSelectionEdge(
      selection,
      active,
      data,
      direction
    );
    // @ts-expect-error
    return nextSelection;
  }
  if (selection instanceof EntireColumnsSelection) {
    // @ts-expect-error
    return modifyEntireColumnsSelection(selection, active, data, direction);
  }
  if (selection instanceof EntireRowsSelection) {
    // @ts-expect-error
    return modifyEntireRowsSelection(selection, active, data, direction);
  }
  return selection;
}

export function modifyRangeSelectionEdge(
  rangeSelection: RangeSelection,
  active: Point.Point,
  data: Matrix.Matrix<unknown>,
  edge: Direction
): RangeSelection {
  const field =
    edge === Direction.Left || edge === Direction.Right ? "column" : "row";

  const key =
    edge === Direction.Left || edge === Direction.Top ? "start" : "end";
  const delta = key === "start" ? -1 : 1;

  const edgeOffsets = rangeSelection.range.has({
    ...active,
    [field]: active[field] + delta * -1,
  });

  const keyToModify = edgeOffsets ? (key === "start" ? "end" : "start") : key;

  const nextRange = new PointRange(
    rangeSelection.range.start,
    rangeSelection.range.end
  );

  nextRange[keyToModify][field] += delta;

  const nextSelection = new RangeSelection(nextRange).normalizeTo(data);

  return nextSelection;
}

export function modifyEntireRowsSelection(
  selection: EntireRowsSelection,
  active: Point.Point,
  data: Matrix.Matrix<unknown>,
  edge: Direction
): EntireRowsSelection {
  if (edge === Direction.Left || edge === Direction.Right) {
    return selection;
  }
  const delta = edge === Direction.Top ? -1 : 1;
  const property = edge === Direction.Top ? "start" : "end";
  const oppositeProperty = property === "start" ? "end" : "start";
  const newSelectionData = { ...selection };
  if (
    edge === Direction.Top
      ? selection.end > active.row
      : selection.start < active.row
  ) {
    newSelectionData[oppositeProperty] = selection[oppositeProperty] + delta;
  } else {
    newSelectionData[property] = selection[property] + delta;
  }
  const nextSelection = new EntireRowsSelection(
    Math.max(newSelectionData.start, 0),
    Math.max(newSelectionData.end, 0)
  );
  return nextSelection.normalizeTo(data);
}

export function modifyEntireColumnsSelection(
  selection: EntireColumnsSelection,
  active: Point.Point,
  data: Matrix.Matrix<unknown>,
  edge: Direction
): EntireColumnsSelection {
  if (edge === Direction.Top || edge === Direction.Bottom) {
    return selection;
  }
  const delta = edge === Direction.Left ? -1 : 1;
  const property = edge === Direction.Left ? "start" : "end";
  const oppositeProperty = property === "start" ? "end" : "start";
  const newSelectionData = { ...selection };
  if (
    edge === Direction.Left
      ? selection.end > active.row
      : selection.start < active.row
  ) {
    newSelectionData[oppositeProperty] = selection[oppositeProperty] + delta;
  } else {
    newSelectionData[property] = selection[property] + delta;
  }
  const nextSelection = new EntireColumnsSelection(
    Math.max(newSelectionData.start, 0),
    Math.max(newSelectionData.end, 0)
  );
  return nextSelection.normalizeTo(data);
}
