import { describe, expect, test } from "vitest";
import { calculateScoreIsValidForEnd } from "@/domain/end";

describe("calculateScoreIsHigherThanPreviousInEnd", () => {
    test("example scenario", () => {
        const scores = [7, 5, 5];
        const isHigherOrEqual = calculateScoreIsValidForEnd(scores, 6);

        expect(isHigherOrEqual(9)).toBeFalsy();
        expect(isHigherOrEqual(7)).toBeFalsy();
        expect(isHigherOrEqual(5)).toBeTruthy();
        expect(isHigherOrEqual(3)).toBeTruthy();
    });

    test('Test lowest score for recent end with multiple ends', () => {
        const scores = [
            8, 9, 10, 7, 6, 8,
            10, 9, 9, 8, 6, 7,
            10, 9, 9, 10, 6
        ];
        const isHigherOrEqual = calculateScoreIsValidForEnd(scores, 6);

        expect(isHigherOrEqual(11)).toBeFalsy();
        expect(isHigherOrEqual(7)).toBeFalsy();
        expect(isHigherOrEqual(6)).toBeTruthy();
        expect(isHigherOrEqual(5)).toBeTruthy();
    });

    test("if there are no scores this end, any number is valid", () => {
        const scores = [
            8, 9, 10, 7, 6, 8,
            10, 9, 9, 8, 6, 3
        ];
        const isHigherOrEqual = calculateScoreIsValidForEnd(scores, 6);

        expect(isHigherOrEqual(5)).toBeTruthy();
        expect(isHigherOrEqual(1)).toBeTruthy();

    });

    test('M is 0', () => {
        const scores = [
            1, "M"
        ]
        const isHigherOrEqual = calculateScoreIsValidForEnd(scores, 6);

        expect(isHigherOrEqual(1)).toBeFalsy();
        expect(isHigherOrEqual("M")).toBeTruthy();
    })
})