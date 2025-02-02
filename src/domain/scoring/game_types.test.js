import { describe, expect, test } from "vitest";
import { gameTypeConfig } from "@/domain/scoring/game_types";

describe("game types", () => {
  test("has the gametypes modelled correctly", () => {
    expect(JSON.stringify(gameTypeConfig, null, 2)).toMatchFileSnapshot(
      "./__snapshots__/gametypes.json"
    );
  });
});
