import { describe, expect, test } from "vitest";
import { newClassificationCalculator } from "@/domain/classification";
import { gameTypeConfig } from "@/domain/game_types";
import { baseConfig } from "@/domain/game_type_config";

describe("classification", () => {
  test("can fetch classification when it exists", () => {
    const calculator = newClassificationCalculator("national 50", "male", "senior", "recurve");

    expect(calculator(349)).toEqual({ classification: "Unclassified", next: "A3", shortBy: 1 });
    expect(calculator(350)).toEqual({ classification: "A3", next: "A2", shortBy: 75 });
    expect(calculator(351)).toEqual({ classification: "A3", next: "A2", shortBy: 74 });

    expect(calculator(424)).toEqual({ classification: "A3", next: "A2", shortBy: 1 });
    expect(calculator(425)).toEqual({ classification: "A2", next: "A1", shortBy: 62 });
    expect(calculator(426)).toEqual({ classification: "A2", next: "A1", shortBy: 61 });

    expect(calculator(486)).toEqual({ classification: "A2", next: "A1", shortBy: 1 });
    expect(calculator(487)).toEqual({ classification: "A1" });
    expect(calculator(488)).toEqual({ classification: "A1" });
  });

  test("if config does not exist, return undefined", () => {
    const calculator = newClassificationCalculator("doesnt exist", "men", "senior", "recurve");
    expect(calculator).toBeUndefined;
  });

  const outdoorRoundsNotFrostbite = baseConfig.filter(r => r.isOutdoor && r.name !== "frostbite").map(r => r.name);
  test.each(outdoorRoundsNotFrostbite)("can get classified for (%s)", (classification) => {
    const calculator = newClassificationCalculator(classification, "male", "senior", "recurve");
    expect(calculator(10000)).not.toEqual({ classification: "Unclassified" });
  });
});