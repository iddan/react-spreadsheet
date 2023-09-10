import { Point } from "../point";

export function toString(point: Point): string {
  return `${point.row},${point.column}`;
}

export function fromString(point: string): Point {
  const [row, column] = point.split(",");
  return { row: Number(row), column: Number(column) };
}
