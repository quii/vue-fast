import { describe } from "vitest";
import { testScoringInterface } from "./ScoringInterface.contract";
import ScoreButtons from "@/components/scoring/ScoreButtons.vue";

describe("ScoreButtons", () => {
  testScoringInterface(ScoreButtons);
})
