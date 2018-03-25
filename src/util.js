// @flow

export const getCellFromPath = (event: {
  path: EventTarget[]
}): { element: Element, row: number, column: number } | null => {
  for (const target of event.path) {
    if (target instanceof Element) {
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
