import { describe, expect, test } from "vitest";
import { calculateRounds } from "@/domain/rounds";
import { justStartedANational, ruthsFrostbiteGame, ruthsGame } from "@/domain/test_data";

describe("calculateRounds", () => {
  test("snapshot test of ruths first competition", () => {
    const gameType = "windsor";
    const result = calculateRounds(ruthsGame, gameType, 6);

    expect(JSON.stringify(result, null, 2)).toMatchFileSnapshot(
      "./__snapshots__/ruths_first_competition.json"
    );
  });
  test("snapshot of a national round that has had 3 ends", () => {
    const gameType = "national";
    const result = calculateRounds(justStartedANational, gameType, 6);

    expect(JSON.stringify(result, null, 2)).toMatchFileSnapshot(
      "./__snapshots__/just_started_a_national.json"
    );
  });
  test("snapshot test of ruths first competition", () => {
    const gameType = "frostbite";
    const result = calculateRounds(ruthsFrostbiteGame, gameType, 6);

    expect(JSON.stringify(result, null, 2)).toMatchFileSnapshot(
      "./__snapshots__/ruths_first_frostbite.json"
    );
  });
});