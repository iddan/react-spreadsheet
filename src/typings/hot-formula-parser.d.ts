declare module "hot-formula-parser" {
  export class Parser {
    /**
     * Parse formula expression.
     *
     * @param expression to parse.
     * @return Returns an object with two properties `error` and `result`.
     */
    parse(
      value: string
    ): { result: string | boolean | number | null; error: string | null };
    on(
      type: "callCellValue",
      handler: (
        cellCoord: { row: { index: number }; column: { index: number } },
        done: (value: any) => void
      ) => void
    ): void;
    on(
      type: "callRangeValue",
      handler: (
        startCellCoord: { row: { index: number }; column: { index: number } },
        endCellCoord: { row: { index: number }; column: { index: number } },
        done: (value: any) => void
      ) => void
    ): void;
  }
  /**
   * Convert row label to index.
   *
   * @param label Row label (eq. '1', '5')
   * @returns Returns -1 if label is not recognized otherwise proper row index.
   */
  export function columnIndexToLabel(label: string): number;
  /**
   * Extract cell coordinates.
   *
   * @param label Cell coordinates (eq. 'A1', '$B6', '$N$98').
   * @returns Returns an array of objects.
   */
  export function extractLabel(
    label: string
  ): [
    {
      index: number;
      label: string;
      isAbsolute: boolean;
    },
    {
      index: number;
      label: string;
      isAbsolute: boolean;
    }
  ];
}
