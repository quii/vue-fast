import { describe, expect, test } from "vitest";
import { calculateScoreIsValidForEnd } from "@/domain/end";

//todo: custom matchers maybe?

describe("calculateScoreIsHigherThanPreviousInEnd", () => {
    const someRoundName = "national";

    test("example scenario", () => {
        const scores = [7, 5, 5];
        const isValid = calculateScoreIsValidForEnd(scores, someRoundName);

        expect(isValid(9)).toBeFalsy();
        expect(isValid(7)).toBeFalsy();
        expect(isValid(5)).toBeTruthy();
        expect(isValid(3)).toBeTruthy();
    });

    test('Test lowest score for recent end with multiple ends', () => {
        const scores = [
            8, 9, 10, 7, 6, 8,
            10, 9, 9, 8, 6, 7,
            10, 9, 9, 10, 6
        ];
        const isValid = calculateScoreIsValidForEnd(scores, someRoundName);

        expect(isValid(11)).toBeFalsy();
        expect(isValid(7)).toBeFalsy();
        expect(isValid(6)).toBeTruthy();
        expect(isValid(5)).toBeTruthy();
    });

    test("if there are no scores this end, any number is valid", () => {
        const scores = [
            8, 9, 10, 7, 6, 8,
            10, 9, 9, 8, 6, 3
        ];
        const isValid = calculateScoreIsValidForEnd(scores, someRoundName);

        expect(isValid(5)).toBeTruthy();
        expect(isValid(1)).toBeTruthy();
    });

    test('M is 0', () => {
        const scores = [
            1, "M"
        ]
        const isValid = calculateScoreIsValidForEnd(scores, someRoundName);

        expect(isValid(1)).toBeFalsy();
        expect(isValid("M")).toBeTruthy();
    })

    test("X is greater than 10 (even though in scores terms it isnt)", () => {
        const scores = ["10"];
        const isValid = calculateScoreIsValidForEnd(scores, someRoundName);

        expect(isValid("9")).toBeTruthy();
    });

    describe("indoor", () => {
        const indoorRoundName = "wa 25m";
        test("shots in groups of 3", () => {
            const scores = ["10", "9", "8"];
            const isValid = calculateScoreIsValidForEnd(scores, indoorRoundName);

            expect(isValid("X")).toBeTruthy();
            expect(isValid("10")).toBeTruthy();
            expect(isValid("9")).toBeTruthy();
        });
    });
})