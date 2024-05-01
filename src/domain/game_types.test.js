import { describe, expect, test } from "vitest";
import { gameTypeConfig } from "@/domain/game_types";

describe("game types", () => {
  // test('blah generate base config from the data', () => {
  //   const allRoundNames = new Set(rawClassifications.map(c => c.round.toLowerCase()))
  //   const based = Array.from(allRoundNames.values()).map(c=> {
  //     return {
  //       name: c,
  //           isOutdoor: true,
  //         isImperial: true,
  //         distancesRoundSizes: [4, 2]
  //     }
  //   })
  //   console.log(based)
  // })

  test("has the gametypes modelled correctly", () => {
    expect(JSON.stringify(gameTypeConfig, null, 2)).toMatchFileSnapshot(
      "./__snapshots__/gametypes.json"
    );
  });
});
