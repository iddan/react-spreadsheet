// @flow

declare module "hot-formula-parser" {
  declare export class Parser {
    on(
      event: string,
      callback: (
        coords: { row: { index: number }, column: { index: number } },
        done: (value: any) => void
      ) => void
    ): void;
    parse(value: string): { result: string, error: string };
  }
  declare export function columnIndexToLabel(column: number): string;
}

declare module "hot-formula-parser/lib/helper/cell" {
  declare export function extractLabel(value: string): [number, number];
}
