import {
  validImperialScores
} from "./scores";
import { test, expect } from "vitest";
import { calculateSubtotals } from "@/domain/subtotals";

// note to ruth: https://vitest.dev/
test("it knows the valid scores of imperial archery", () => {
  expect(validImperialScores).toEqual([9, 7, 5, 3, 1, "M"]);
});

test.each([
  [[], 0],
  [[1, 3], 4],
  [[1, 3, 5, 7, 9, "M"], 25],
  [[1, 3, 5, 7, 9, 1], 26],
  [[1, 3, 5, 7, 9, 3], 28],
  [[1, 3, 5, 7, 9, 5], 30],
  [[1, 3, 5, 7, 9, 7], 32],
  [["X", "X", "X", "X"], 40],
  [[1, 3, 5, 7, 9, 9], 34]
])('it can calculate totals', (scores, expectedTotal) => {
  expect(calculateSubtotals(scores).totalScore).toEqual(expectedTotal)
})

test.each([
  [[], 0],
  [[1, 3, 5, 7, 9, 7], 6],
  [[1, 3, 5, 7, 9, 'M'], 5],
  [[1, 3, 5, 7, 'M', 'M'], 4],
  [[1, 3, 5, 'M', 'M', 'M'], 3],
  [[1, 3, 'M', 'M', 'M', 'M'], 2],
  [[1, 'M', 'M', 'M', 'M', 'M'], 1],
  [['M', 'M', 'M', 'M', 'M', 'M'], 0]
])('it can calculate hits', (scores, expectedHitCount) => {
  expect(calculateSubtotals(scores).hits).toEqual(expectedHitCount)
})

test.each([
  [[9, 9, 9, 9, 9, 9], 6],
  [[1, 9, 9, 9, 9, 9], 5],
  [[1, 3, 9, 9, 9, 9], 4],
  [[1, 3, 5, 9, 9, 9], 3],
  [[1, 3, 5, 'M', 9, 9], 2],
  [[1, 3, 5, 'M', 1, 9], 1],
  [[1, 3, 5, 'M', 1, 7], 0]
])('it can calculate golds', (scores, expectedGoldsCount) => {
  expect(calculateSubtotals(scores).golds).toEqual(expectedGoldsCount)
})
