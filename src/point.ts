/** A cell coordinates in the spreadsheet */
export type Point = {
  /** The cell's column */
  column: number;
  /** The cell's row */
  row: number;
};

/** Returns whether given value is a point */
export function is(value: unknown): value is Point {
  return (
    // @ts-ignore
    typeof value?.row === "number" &&
    // @ts-ignore
    typeof value?.column === "number"
  );
}

/** Return whether two given points are the equal */
export function isEqual(source: Point, target: Point): boolean {
  return source.column === target.column && source.row === target.row;
}

/** The origin point in matrices */
export const ORIGIN: Point = { row: 0, column: 0 };
