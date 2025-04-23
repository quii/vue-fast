import { expect, describe, test } from "vitest";
import { calculateSubtotals } from "@/domain/scoring/subtotals";

const imperialRound = "national";
const metricRound = "wa 70m";
const worcesterRound = 'worcester'

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
  expect(calculateSubtotals(scores, imperialRound).totalScore).toEqual(expectedTotal);
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
  expect(calculateSubtotals(scores, imperialRound).hits).toEqual(expectedHitCount);
})

test.each([
  [[9, 9, 9, 9, 9, 9], 0],
  [["X", 9, 9, 9, 9, 9], 1],
  [["X", "X", 9, 9, 9, 9], 2]
])("it can calculate X", (scores, expectedXCount) => {
  expect(calculateSubtotals(scores, metricRound).X).toEqual(expectedXCount);
});

describe("worcester", () => {
  test("X in worcester counts as 5", () => {
    expect(calculateSubtotals(['X', 'X', 5], worcesterRound).totalScore).toEqual(15)
  });

  // Add new tests for Worcester gold threshold
  test('scores of 5 and above count as golds in Worcester', () => {
    expect(calculateSubtotals([5, 5, 5, 4, 4, 4], worcesterRound).golds).toEqual(3)
  })

  test('scores below 5 don\'t count as golds in Worcester', () => {
    expect(calculateSubtotals([4, 4, 4, 3, 3, 3], worcesterRound).golds).toEqual(0)
  })

  test('X counts as gold in Worcester', () => {
    expect(calculateSubtotals(['X', 'X', 5, 4, 3, 2], worcesterRound).golds).toEqual(3)
  })
});

describe("metric golds are only 10 and X", () => {
  test("10 in metric golds counts as 10", () => {
    expect(calculateSubtotals([10, 10, 10], metricRound).golds).toEqual(3);
  });

  test("X in metric golds counts as 10", () => {
    expect(calculateSubtotals(["X", "X", 10], metricRound).golds).toEqual(3);
  });

  test("9 does not count as a gold", () => {
    expect(calculateSubtotals([9, 9, 9], metricRound).golds).toEqual(0);
  });
});

describe("imperial rounds only have 9 as gold", () => {
  test("9 golds as gold", () => {
    expect(calculateSubtotals([9, 9, 9], imperialRound).golds).toEqual(3);
  });

  test("another example", () => {
    expect(calculateSubtotals([9, 7, 7], imperialRound).golds).toEqual(1);
  });

  test("less than 9 does not count as gold", () => {
    expect(calculateSubtotals([7, 7, 7], imperialRound).golds).toEqual(0);
  });
});