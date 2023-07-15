import { describe, expect, test } from "vitest";
import { calculateRounds } from "@/domain/rounds";
import { justStartedANational, ruthsGame } from "@/domain/test_data";

describe("calculateRounds", () => {
  test("snapshot test of ruths first competition", () => {
    const gameType = "windsor";
    const result = calculateRounds(ruthsGame, gameType);

    expect(JSON.stringify(result, null, 2)).toMatchFileSnapshot(
      "./__snapshots__/ruths_first_competition.json"
    );
  });
  test("snapshot of a national round that has had 3 ends", () => {
    const gameType = "national";
    const result = calculateRounds(justStartedANational, gameType);

    expect(JSON.stringify(result, null, 2)).toMatchFileSnapshot(
      "./__snapshots__/just_started_a_national.json"
    );
  });
});