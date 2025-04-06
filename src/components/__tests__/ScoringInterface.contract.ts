import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";

export function testScoringInterface(Component) {
  describe("Scoring Interface", () => {
    it("renders buttons for each type of score, and emits an event when clicked", () => {
      const validScores = [9, 7, "M"];
      const wrapper = mount(Component, {
        props: {
          validScores,
          scores: [],
          gameType: "national",
          maxReached: false
        }
      });

      wrapper.find("[data-test=\"score-9\"]").trigger("click");
      expect(wrapper.emitted().score[0][0].score).toBe(9);

      wrapper.find("[data-test=\"score-7\"]").trigger("click");
      expect(wrapper.emitted().score[1][0].score).toBe(7);

      wrapper.find("[data-test=\"score-M\"]").trigger("click");
      expect(wrapper.emitted().score[2][0].score).toBe("M");
    });

    it("enforces descending score order within an end", () => {
      const validScores = [9, 7, 5, "M"];
      const wrapper = mount(Component, {
        props: {
          validScores,
          scores: [7],
          gameType: "national",
          maxReached: false
        }
      });

      // Should not emit a score when clicking higher than previous
      wrapper.find("[data-test=\"score-9\"]").trigger("click");
      expect(wrapper.emitted().score).toBeUndefined();

      // Should emit a score when clicking lower than previous
      wrapper.find("[data-test=\"score-5\"]").trigger("click");
      expect(wrapper.emitted().score[0][0].score).toBe(5);
    });

    it("allows highest scores again when starting a new end", () => {
      const validScores = [9, 7, 5, "M"];
      const wrapper = mount(Component, {
        props: {
          validScores,
          scores: [7, 7, 5, 5, 5],  // 5 arrows
          gameType: "national",
          maxReached: false
        }
      });

      // Can't score a 9 while completing current end
      wrapper.find("[data-test=\"score-9\"]").trigger("click");
      expect(wrapper.emitted().score).toBeUndefined();

      // Complete the end with a 5
      wrapper.find("[data-test=\"score-5\"]").trigger("click");
      expect(wrapper.emitted().score[0][0].score).toBe(5);
    });
  });
}
