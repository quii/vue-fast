import {describe, expect, test} from "vitest";
import {getLowestScoreForRecentEnd} from "@/domain/end";

describe('getLowestScoreForRecentEnd', () => {

    test('Test lowest score for recent end with small array', () => {
        const scores = [8, 9, 10];
        expect(getLowestScoreForRecentEnd(scores)).toEqual(8)
    });

    test('Test lowest score for recent end with multiple ends', () => {
        const scores = [
            8, 9, 10, 7, 6, 8,
            10, 9, 9, 8, 6, 7,
            10, 9, 9, 10, 6
        ];
        expect(getLowestScoreForRecentEnd(scores)).toEqual(6)
    });

    test('if there are no scores this end, the lowest score is infinity', () => {
        const scores = [
            8, 9, 10, 7, 6, 8,
            10, 9, 9, 8, 6, 3
        ];
        expect(getLowestScoreForRecentEnd(scores)).toEqual(Infinity)
    });

    test('another scenario', () => {
        const scores = [
            7,5,5,3,1,1,
            1,1,1,1,1,1,
            9
        ]
        expect(getLowestScoreForRecentEnd(scores)).toEqual(9)
    })

    test('M is 0', () => {
        const scores = [
            1, "M"
        ]
        expect(getLowestScoreForRecentEnd(scores)).toEqual(0)
    })
})
