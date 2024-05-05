import { describe, expect, test } from "vitest";
import { cjSave, mallySave } from "@/domain/test_data";
import { userDataFixer } from "@/domain/user_data_fixer";

describe("user data fixer", () => {
  test("concatenates distances with roundname for outdoor scores, and removes distances", () => {
    const result = userDataFixer(cjSave);
    expect(JSON.stringify(result, null, 2)).toMatchFileSnapshot(
      "./__snapshots__/cj_data_fixed.json"
    );
  });

  test("fixes scoresheet that doesn't have ids", () => {
    const result = userDataFixer(mallySave);
    expect(JSON.stringify(result, null, 2)).toMatchFileSnapshot(
      "./__snapshots__/mally_data_fixed.json"
    );
  });
});