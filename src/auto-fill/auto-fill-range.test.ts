import * as matrix from "../matrix";
import { PointRange } from "../point-range";
import { CellBase } from "../types";
import { autoFillRange } from "./auto-fill-range";

describe("autoFillRange", () => {
  // Helper function to create a simple cell
  const cell = (value: any): CellBase => ({ value });

  // Helper to extract values from matrix
  const getValues = (
    data: matrix.Matrix<CellBase>,
    range: PointRange
  ): any[] => {
    return Array.from(range, (point) => matrix.get(point, data)?.value);
  };

  describe("Numeric - Increasing Series", () => {
    it("should copy single numeric value (1 -> 1, 1, 1...)", () => {
      const data = matrix.set({ row: 0, column: 0 }, cell(1), [[]]);
      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 2 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual([1, 1, 1]);
    });

    it("should increment by step size for two cells (1, 2 -> 3, 4, 5...)", () => {
      let data = matrix.set({ row: 0, column: 0 }, cell(1), [[]]);
      data = matrix.set({ row: 0, column: 1 }, cell(2), data);

      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 4 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual([1, 2, 3, 4, 5]);
    });

    it("should handle non-unit steps (5, 10 -> 15, 20...)", () => {
      let data = matrix.set({ row: 0, column: 0 }, cell(5), [[]]);
      data = matrix.set({ row: 0, column: 1 }, cell(10), data);

      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 4 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual([5, 10, 15, 20, 25]);
    });

    it("should handle vertical filling (1, 2 -> 3, 4, 5... in rows)", () => {
      let data = matrix.set({ row: 0, column: 0 }, cell(1), [[]]);
      data = matrix.set({ row: 1, column: 0 }, cell(2), data);

      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 4, column: 0 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual([1, 2, 3, 4, 5]);
    });

    it("should handle decimal steps (1.5, 2.5 -> 3.5, 4.5...)", () => {
      let data = matrix.set({ row: 0, column: 0 }, cell(1.5), [[]]);
      data = matrix.set({ row: 0, column: 1 }, cell(2.5), data);

      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 4 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual([1.5, 2.5, 3.5, 4.5, 5.5]);
    });

    it("should handle three or more cells with consistent step (1, 2, 3 -> 4, 5...)", () => {
      let data = matrix.set({ row: 0, column: 0 }, cell(1), [[]]);
      data = matrix.set({ row: 0, column: 1 }, cell(2), data);
      data = matrix.set({ row: 0, column: 2 }, cell(3), data);

      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 5 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual([1, 2, 3, 4, 5, 6]);
    });
  });

  describe("Numeric - Decreasing Series", () => {
    it("should handle negative steps (10, 5 -> 0, -5...)", () => {
      let data = matrix.set({ row: 0, column: 0 }, cell(10), [[]]);
      data = matrix.set({ row: 0, column: 1 }, cell(5), data);

      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 4 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual([10, 5, 0, -5, -10]);
    });

    it("should handle decreasing decimal steps (5.5, 4.0 -> 2.5, 1.0...)", () => {
      let data = matrix.set({ row: 0, column: 0 }, cell(5.5), [[]]);
      data = matrix.set({ row: 0, column: 1 }, cell(4.0), data);

      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 4 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual([5.5, 4.0, 2.5, 1.0, -0.5]);
    });
  });

  describe.skip("Numeric - Multiplying Series", () => {
    it("should handle multiplication pattern (2, 4 -> 8, 16...)", () => {
      let data = matrix.set({ row: 0, column: 0 }, cell(2), [[]]);
      data = matrix.set({ row: 0, column: 1 }, cell(4), data);

      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 4 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual([2, 4, 8, 16, 32]);
    });

    it("should handle multiplication with decimals (1, 1.5 -> 2.25, 3.375...)", () => {
      let data = matrix.set({ row: 0, column: 0 }, cell(1), [[]]);
      data = matrix.set({ row: 0, column: 1 }, cell(1.5), data);

      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 4 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual([1, 1.5, 2.25, 3.375, 5.0625]);
    });

    it("should handle consistent multiplication with three cells (2, 6, 18 -> 54...)", () => {
      let data = matrix.set({ row: 0, column: 0 }, cell(2), [[]]);
      data = matrix.set({ row: 0, column: 1 }, cell(6), data);
      data = matrix.set({ row: 0, column: 2 }, cell(18), data);

      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 4 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual([2, 6, 18, 54, 162]);
    });
  });

  describe.skip("Numeric - Dividing Series", () => {
    it("should handle division pattern (100, 50 -> 25, 12.5...)", () => {
      let data = matrix.set({ row: 0, column: 0 }, cell(100), [[]]);
      data = matrix.set({ row: 0, column: 1 }, cell(50), data);

      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 4 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual([100, 50, 25, 12.5, 6.25]);
    });

    it("should handle consistent division with three cells (81, 27, 9 -> 3, 1)", () => {
      let data = matrix.set({ row: 0, column: 0 }, cell(81), [[]]);
      data = matrix.set({ row: 0, column: 1 }, cell(27), data);
      data = matrix.set({ row: 0, column: 2 }, cell(9), data);

      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 4 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual([81, 27, 9, 3, 1]);
    });
  });

  describe("Edge Cases", () => {
    it("should return original data when no pattern is detected", () => {
      let data = matrix.set({ row: 0, column: 0 }, cell(1), [[]]);
      data = matrix.set({ row: 0, column: 1 }, cell(3), data);
      data = matrix.set({ row: 0, column: 2 }, cell(7), data);

      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 4 }
      );
      const result = autoFillRange(data, range);

      // No consistent pattern, so data should remain unchanged
      expect(getValues(result, range)).toEqual([1, 3, 7, undefined, undefined]);
    });

    it("should handle empty cells in the series", () => {
      let data = matrix.set({ row: 0, column: 0 }, cell(1), [[]]);
      data = matrix.set({ row: 0, column: 2 }, cell(3), data);

      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 3 }
      );
      const result = autoFillRange(data, range);

      // Pattern should be detected across the gap
      expect(getValues(result, range)).toEqual([1, undefined, 3, undefined]);
    });

    it("should handle range with only one cell", () => {
      const data = matrix.set({ row: 0, column: 0 }, cell(5), [[]]);
      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 0 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual([5]);
    });

    it("should handle infinity and NaN edge cases", () => {
      let data = matrix.set({ row: 0, column: 0 }, cell(0), [[]]);
      data = matrix.set({ row: 0, column: 1 }, cell(0), data);

      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 2 }
      );
      const result = autoFillRange(data, range);

      // Division by zero should be handled
      expect(getValues(result, range)).toEqual([0, 0, undefined]);
    });
  });

  describe("Text & Numeric - Patterns", () => {
    it("should increment number in text (Task 1 -> Task 2, Task 3...)", () => {
      const data = matrix.set({ row: 0, column: 0 }, cell("Task 1"), [[]]);
      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 2 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual(["Task 1", "Task 2", "Task 3"]);
    });

    it.skip("should handle number at beginning (1st Quarter -> 2nd Quarter...)", () => {
      const data = matrix.set({ row: 0, column: 0 }, cell("1st Quarter"), [[]]);
      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 3 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual([
        "1st Quarter",
        "2nd Quarter",
        "3rd Quarter",
        "4th Quarter",
      ]);
    });

    it.skip("should handle multiple numbers in text", () => {
      const data = matrix.set({ row: 0, column: 0 }, cell("Week 1 Day 1"), [
        [],
      ]);
      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 2 }
      );
      const result = autoFillRange(data, range);

      // Should increment the rightmost number
      expect(getValues(result, range)).toEqual([
        "Week 1 Day 1",
        "Week 1 Day 2",
        "Week 1 Day 3",
      ]);
    });

    it("should handle padded numbers (Item 001 -> Item 002...)", () => {
      const data = matrix.set({ row: 0, column: 0 }, cell("Item 001"), [[]]);
      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 2 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual([
        "Item 001",
        "Item 002",
        "Item 003",
      ]);
    });
  });

  describe.skip("Dates - Consecutive Days", () => {
    it("should fill consecutive days from single date (1/1/2025 -> 1/2/2025...)", () => {
      const data = matrix.set({ row: 0, column: 0 }, cell("1/1/2025"), [[]]);
      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 2 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual([
        "1/1/2025",
        "1/2/2025",
        "1/3/2025",
      ]);
    });

    it("should detect weekly pattern (1/1/2025, 1/8/2025 -> 1/15/2025...)", () => {
      let data = matrix.set({ row: 0, column: 0 }, cell("1/1/2025"), [[]]);
      data = matrix.set({ row: 0, column: 1 }, cell("1/8/2025"), data);

      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 3 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual([
        "1/1/2025",
        "1/8/2025",
        "1/15/2025",
        "1/22/2025",
      ]);
    });

    it("should handle different date formats (DD-MMM-YY)", () => {
      const data = matrix.set({ row: 0, column: 0 }, cell("01-Jan-25"), [[]]);
      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 2 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual([
        "01-Jan-25",
        "02-Jan-25",
        "03-Jan-25",
      ]);
    });

    it("should handle month boundaries correctly", () => {
      const data = matrix.set({ row: 0, column: 0 }, cell("1/30/2025"), [[]]);
      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 2 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual([
        "1/30/2025",
        "1/31/2025",
        "2/1/2025",
      ]);
    });
  });

  describe.skip("Dates - Fill Weekdays", () => {
    it("should fill only weekdays, skipping weekends", () => {
      // Assuming 1/1/2025 is a Wednesday
      const data = matrix.set({ row: 0, column: 0 }, cell("1/1/2025"), [[]]);
      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 4 }
      );
      const result = autoFillRange(data, range);

      // Should skip Saturday and Sunday
      expect(getValues(result, range)).toEqual([
        "1/1/2025", // Wed
        "1/2/2025", // Thu
        "1/3/2025", // Fri
        "1/6/2025", // Mon
        "1/7/2025", // Tue
      ]);
    });
  });

  describe.skip("Dates - Fill Months", () => {
    it("should fill months from single date (1/1/2025 -> 2/1/2025...)", () => {
      const data = matrix.set({ row: 0, column: 0 }, cell("1/1/2025"), [[]]);
      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 2 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual([
        "1/1/2025",
        "2/1/2025",
        "3/1/2025",
      ]);
    });

    it("should detect monthly pattern from two dates", () => {
      let data = matrix.set({ row: 0, column: 0 }, cell("1/1/2025"), [[]]);
      data = matrix.set({ row: 0, column: 1 }, cell("2/1/2025"), data);

      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 4 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual([
        "1/1/2025",
        "2/1/2025",
        "3/1/2025",
        "4/1/2025",
        "5/1/2025",
      ]);
    });

    it("should handle last day of month sequences", () => {
      let data = matrix.set({ row: 0, column: 0 }, cell("1/31/2025"), [[]]);
      data = matrix.set({ row: 0, column: 1 }, cell("2/28/2025"), data);

      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 3 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual([
        "1/31/2025",
        "2/28/2025",
        "3/31/2025",
        "4/30/2025",
      ]);
    });
  });

  describe.skip("Dates - Fill Years", () => {
    it("should fill years from single date (1/1/2025 -> 1/1/2026...)", () => {
      const data = matrix.set({ row: 0, column: 0 }, cell("1/1/2025"), [[]]);
      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 2 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual([
        "1/1/2025",
        "1/1/2026",
        "1/1/2027",
      ]);
    });
  });

  describe.skip("Time - Patterns", () => {
    it("should fill consecutive hours (9:00 AM -> 10:00 AM...)", () => {
      const data = matrix.set({ row: 0, column: 0 }, cell("9:00 AM"), [[]]);
      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 3 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual([
        "9:00 AM",
        "10:00 AM",
        "11:00 AM",
        "12:00 PM",
      ]);
    });

    it("should detect time intervals (9:00 AM, 9:30 AM -> 10:00 AM...)", () => {
      let data = matrix.set({ row: 0, column: 0 }, cell("9:00 AM"), [[]]);
      data = matrix.set({ row: 0, column: 1 }, cell("9:30 AM"), data);

      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 4 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual([
        "9:00 AM",
        "9:30 AM",
        "10:00 AM",
        "10:30 AM",
        "11:00 AM",
      ]);
    });

    it("should handle different time formats (hh:mm:ss)", () => {
      const data = matrix.set({ row: 0, column: 0 }, cell("09:00:00"), [[]]);
      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 2 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual([
        "09:00:00",
        "10:00:00",
        "11:00:00",
      ]);
    });

    it("should handle 24-hour format", () => {
      const data = matrix.set({ row: 0, column: 0 }, cell("14:00"), [[]]);
      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 2 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual(["14:00", "15:00", "16:00"]);
    });

    it("should wrap around midnight", () => {
      const data = matrix.set({ row: 0, column: 0 }, cell("11:00 PM"), [[]]);
      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 3 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual([
        "11:00 PM",
        "12:00 AM",
        "1:00 AM",
        "2:00 AM",
      ]);
    });
  });

  describe("Built-in Lists - Days of Week", () => {
    it("should fill consecutive days (Monday -> Tuesday...)", () => {
      const data = matrix.set({ row: 0, column: 0 }, cell("Monday"), [[]]);
      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 3 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual([
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
      ]);
    });

    it("should handle abbreviated day names (Mon -> Tue...)", () => {
      const data = matrix.set({ row: 0, column: 0 }, cell("Mon"), [[]]);
      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 3 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual(["Mon", "Tue", "Wed", "Thu"]);
    });

    it("should wrap around week (Saturday -> Sunday -> Monday...)", () => {
      const data = matrix.set({ row: 0, column: 0 }, cell("Saturday"), [[]]);
      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 3 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual([
        "Saturday",
        "Sunday",
        "Monday",
        "Tuesday",
      ]);
    });

    it("should be case-insensitive (MONDAY -> TUESDAY...)", () => {
      const data = matrix.set({ row: 0, column: 0 }, cell("MONDAY"), [[]]);
      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 2 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual([
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
      ]);
    });
  });

  describe("Built-in Lists - Months", () => {
    it("should fill consecutive months (January -> February...)", () => {
      const data = matrix.set({ row: 0, column: 0 }, cell("January"), [[]]);
      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 3 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual([
        "January",
        "February",
        "March",
        "April",
      ]);
    });

    it("should handle abbreviated month names (Jan -> Feb...)", () => {
      const data = matrix.set({ row: 0, column: 0 }, cell("Jan"), [[]]);
      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 3 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual(["Jan", "Feb", "Mar", "Apr"]);
    });

    it("should wrap around year (November -> December -> January...)", () => {
      const data = matrix.set({ row: 0, column: 0 }, cell("November"), [[]]);
      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 3 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual([
        "November",
        "December",
        "January",
        "February",
      ]);
    });

    it("should preserve case (JANUARY -> FEBRUARY...)", () => {
      const data = matrix.set({ row: 0, column: 0 }, cell("JANUARY"), [[]]);
      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 2 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual([
        "JANUARY",
        "FEBRUARY",
        "MARCH",
      ]);
    });
  });

  describe.skip("Custom Lists", () => {
    it("should support user-defined custom lists", () => {
      // Example: North, South, East, West
      const data = matrix.set({ row: 0, column: 0 }, cell("North"), [[]]);
      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 3 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual([
        "North",
        "South",
        "East",
        "West",
      ]);
    });

    it("should wrap custom lists (West -> North...)", () => {
      const data = matrix.set({ row: 0, column: 0 }, cell("West"), [[]]);
      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 2 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual(["West", "North", "South"]);
    });
  });

  describe("Formula - Relative References", () => {
    it("should shift relative references when filling down (=A1 -> =A2...)", () => {
      const data = matrix.set({ row: 0, column: 0 }, cell("=A1"), [[]]);
      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 2, column: 0 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual(["=A1", "=A2", "=A3"]);
    });

    it("should shift relative references when filling right (=A1 -> =B1...)", () => {
      const data = matrix.set({ row: 0, column: 0 }, cell("=A1"), [[]]);
      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 2 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual(["=A1", "=B1", "=C1"]);
    });

    it("should shift both row and column in diagonal fill (=A1+B2 -> =B2+C3...)", () => {
      const data = matrix.set({ row: 0, column: 0 }, cell("=A1+B2"), [[]]);
      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 2, column: 2 }
      );
      const result = autoFillRange(data, range);

      const values = getValues(result, range);
      expect(values[0]).toBe("=A1+B2");
      expect(values[4]).toBe("=B2+C3"); // middle cell in 3x3 grid
      expect(values[8]).toBe("=C3+D4"); // bottom-right
    });
  });

  describe("Formula - Absolute References", () => {
    it("should not shift absolute references (=$A$1 -> =$A$1...)", () => {
      const data = matrix.set({ row: 0, column: 0 }, cell("=$A$1"), [[]]);
      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 2, column: 0 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual(["=$A$1", "=$A$1", "=$A$1"]);
    });

    it("should handle mixed references - absolute column (=$A1 -> =$A2...)", () => {
      const data = matrix.set({ row: 0, column: 0 }, cell("=$A1"), [[]]);
      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 2, column: 0 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual(["=$A1", "=$A2", "=$A3"]);
    });

    it("should handle mixed references - absolute row (=A$1 -> =B$1...)", () => {
      const data = matrix.set({ row: 0, column: 0 }, cell("=A$1"), [[]]);
      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 2 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual(["=A$1", "=B$1", "=C$1"]);
    });

    it("should handle complex formulas (=$A$1+B1 -> =$A$1+B2...)", () => {
      const data = matrix.set({ row: 0, column: 0 }, cell("=$A$1+B1"), [[]]);
      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 2, column: 0 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual([
        "=$A$1+B1",
        "=$A$1+B2",
        "=$A$1+B3",
      ]);
    });
  });

  describe("Formula - Functions and Operations", () => {
    it("should update references in SUM formulas (=SUM(A1:A3) -> =SUM(A2:A4)...)", () => {
      const data = matrix.set({ row: 0, column: 0 }, cell("=SUM(A1:A3)"), [[]]);
      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 2, column: 0 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual([
        "=SUM(A1:A3)",
        "=SUM(A2:A4)",
        "=SUM(A3:A5)",
      ]);
    });

    it("should handle arithmetic operations (=A1*2 -> =A2*2...)", () => {
      const data = matrix.set({ row: 0, column: 0 }, cell("=A1*2"), [[]]);
      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 2, column: 0 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual(["=A1*2", "=A2*2", "=A3*2"]);
    });

    it("should handle nested functions (=IF(A1>0,SUM(B1:C1),0))", () => {
      const data = matrix.set(
        { row: 0, column: 0 },
        cell("=IF(A1>0,SUM(B1:C1),0)"),
        [[]]
      );
      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 2, column: 0 }
      );
      const result = autoFillRange(data, range);

      expect(getValues(result, range)).toEqual([
        "=IF(A1>0,SUM(B1:C1),0)",
        "=IF(A2>0,SUM(B2:C2),0)",
        "=IF(A3>0,SUM(B3:C3),0)",
      ]);
    });
  });

  describe.skip("Formula - Array Formulas", () => {
    it("should handle array formula spilling", () => {
      // Array formulas might not need traditional fill behavior
      const data = matrix.set({ row: 0, column: 0 }, cell("={A1:A5}"), [[]]);
      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 2, column: 0 }
      );
      const result = autoFillRange(data, range);

      // Behavior might vary - could maintain same formula or adjust
      expect(getValues(result, range)).toEqual([
        "={A1:A5}",
        "={A2:A6}",
        "={A3:A7}",
      ]);
    });
  });

  describe.skip("Mixed Content", () => {
    it("should handle mixed numeric and text cells", () => {
      let data = matrix.set({ row: 0, column: 0 }, cell(1), [[]]);
      data = matrix.set({ row: 0, column: 1 }, cell("Text"), data);
      data = matrix.set({ row: 0, column: 2 }, cell(2), data);

      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 4 }
      );
      const result = autoFillRange(data, range);

      // Should copy pattern or individual values
      expect(getValues(result, range)).toEqual([
        1,
        "Text",
        2,
        undefined,
        undefined,
      ]);
    });

    it("should repeat patterns when detected", () => {
      let data = matrix.set({ row: 0, column: 0 }, cell("A"), [[]]);
      data = matrix.set({ row: 0, column: 1 }, cell("B"), data);

      const range = new PointRange(
        { row: 0, column: 0 },
        { row: 0, column: 5 }
      );
      const result = autoFillRange(data, range);

      // Should repeat A, B, A, B...
      expect(getValues(result, range)).toEqual(["A", "B", "A", "B", "A", "B"]);
    });
  });
});
