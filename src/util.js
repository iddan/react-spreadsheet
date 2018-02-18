// @flow

export const normalizeIndex = (array: Array<*>, index: number) => {
  if (index in array) {
    return index;
  }
  if (index >= array.length) {
    return array.length - 1;
  }
  const [firstIndex] = array.keys();
  return firstIndex;
};

export const getCellFromPath = (event: { path: EventTarget[] }) => {
  for (const target of event.path) {
    if (target instanceof HTMLTableCellElement) {
      const row = Number(target.dataset.row);
      const column = Number(target.dataset.column);
      if (isNaN(row) || isNaN(column)) {
        continue;
      }
      return { element: target, row, column };
    }
  }
  return null;
};

export const moveCursorToEnd = (el: HTMLInputElement) => {
  el.selectionStart = el.selectionEnd = el.value.length;
};

export const shallowEqual = (src: Object, target: Object) =>
  Object.keys(src).every(key => src[key] === target[key]);
