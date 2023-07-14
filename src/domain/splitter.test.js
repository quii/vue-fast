import { expect, describe, it } from 'vitest'
import splitIntoChunksofSizes from "@/domain/splitter";

// write a test that shows given an array of [1 2 3 4 5] the splitter function with an array of chunks [1 4] returns [[1], [2, 3, 4, 5]]

describe('splitter takes an array and an array of chunk sizes and returns an array of arrays', () => {
  it('should split the array into chunks of 1 and 4', () => {
    const got = splitIntoChunksofSizes([1, 2, 3, 4, 5], [1, 4]);
    const want = [[1], [2, 3, 4, 5]];
    expect(got).toEqual(want);
  });

  it('should split the array into chunks of equal sizes', () => {
    const got = splitIntoChunksofSizes([1, 2, 3, 4, 5, 6], [2, 2, 2]);
    const want = [[1, 2], [3, 4], [5, 6]];
    expect(got).toEqual(want);
  });

  it('should split the array into chunks with varying sizes', () => {
    const got = splitIntoChunksofSizes([1, 2, 3, 4, 5], [2, 3]);
    const want = [[1, 2], [3, 4, 5]];
    expect(got).toEqual(want);
  });

  it('should handle when the array is empty', () => {
    const got = splitIntoChunksofSizes([], [2, 3]);
    const want = [[], []];
    expect(got).toEqual(want);
  });

  it('should handle when the chunk sizes are empty', () => {
    const got = splitIntoChunksofSizes([1, 2, 3, 4, 5], []);
    const want = [];
    expect(got).toEqual(want);
  });

  it('should handle when the array length is less than the sum of chunk sizes', () => {
    const got = splitIntoChunksofSizes([1, 2, 3, 4, 5], [2, 6]);
    const want = [[1, 2], [3, 4, 5]];
    expect(got).toEqual(want);
  });
});
