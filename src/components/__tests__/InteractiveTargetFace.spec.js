import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { testScoringInterface } from "./ScoringInterface.contract";
import InteractiveTargetFace from "@/components/scoring/InteractiveTargetFace.vue";

describe("InteractiveTargetFace", () => {
  testScoringInterface(InteractiveTargetFace);

  it("emits score events with position data", () => {
    const wrapper = mount(InteractiveTargetFace, {
      props: {
        validScores: [9, 7, "M"],
        scores: [],
        gameType: "national",
        maxReached: false
      }
    });

    wrapper.find("[data-test=\"score-9\"]").trigger("click", {
      clientX: 100,
      clientY: 100
    });

    const emittedScore = wrapper.emitted().score[0][0];
    expect(emittedScore.position).toBeDefined();
    expect(emittedScore.position.x).toBeTypeOf("number");
    expect(emittedScore.position.y).toBeTypeOf("number");
  });
});
