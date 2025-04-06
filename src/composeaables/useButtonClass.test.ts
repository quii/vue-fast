import { describe, it, expect } from "vitest";
import useButtonClass from "@/composeaables/useButtonClass";

describe("useButtonClass", () => {
  const buttonClass = useButtonClass();

  it("should return correct class for worcester game type and score 5", () => {
    const result = buttonClass(5, "worcester");
    expect(result).toEqual({ "worcester5": true });
  });

  it("should return correct class for worcester game type and score not 5", () => {
    const result = buttonClass(3, "worcester");
    expect(result).toEqual({ "worcesterRest": true });
  });

  it("should return correct class for non-worcester game type", () => {
    const result = buttonClass(3, "otherGameType");
    expect(result).toEqual({ "score3": true });
  });
});