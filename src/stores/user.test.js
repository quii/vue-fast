import { describe, it, expect, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useUserStore } from "@/stores/user";

describe("User Store with Classification Updates", () => {
  beforeEach(() => {
    // Create a fresh pinia instance for each test
    setActivePinia(createPinia());
  });

  it("should store and retrieve indoor classifications by bow type", () => {
    const userStore = useUserStore();

    // Set classifications for different bow types
    userStore.setIndoorClassification("recurve", "B3");
    userStore.setIndoorClassification("barebow", "A2");

    // Check if they're stored correctly
    expect(userStore.getIndoorClassification("recurve")).toBe("B3");
    expect(userStore.getIndoorClassification("barebow")).toBe("A2");
    expect(userStore.getIndoorClassification("longbow")).toBe("Unclassified"); // Not set yet
  });

  it("should store and retrieve outdoor classifications by bow type", () => {
    const userStore = useUserStore();

    // Set classifications for different bow types
    userStore.setOutdoorClassification("recurve", "B2");
    userStore.setOutdoorClassification("barebow", "A1");

    // Check if they're stored correctly
    expect(userStore.getOutdoorClassification("recurve")).toBe("B2");
    expect(userStore.getOutdoorClassification("barebow")).toBe("A1");
    expect(userStore.getOutdoorClassification("longbow")).toBe("Unclassified"); // Not set yet
  });

  it("should save and load all user data including classifications", () => {
    const userStore = useUserStore();

    const indoorClassifications = { "recurve": "B3", "barebow": "A2" };
    const outdoorClassifications = { "recurve": "B2", "barebow": "A1" };

    userStore.save(
      "senior", // ageGroup
      "male", // gender
      "recurve", // bowType
      indoorClassifications,
      outdoorClassifications,
      "2023-10-01", // indoorSeasonStartDate
      "2023-04-01", // outdoorSeasonStartDate
      80, // maxYards
      "John Doe", // name
      true, // constructiveCriticism
      false, // experimentalTargetFace
      "#FF0000" // knockColor
    );

    // Check if all data is stored correctly
    expect(userStore.user.ageGroup).toBe("senior");
    expect(userStore.user.gender).toBe("male");
    expect(userStore.user.bowType).toBe("recurve");
    expect(userStore.user.indoorClassifications).toEqual(indoorClassifications);
    expect(userStore.user.outdoorClassifications).toEqual(outdoorClassifications);
    expect(userStore.user.indoorSeasonStartDate).toBe("2023-10-01");
    expect(userStore.user.outdoorSeasonStartDate).toBe("2023-04-01");
    expect(userStore.user.maxYards).toBe(80);
    expect(userStore.user.name).toBe("John Doe");
    expect(userStore.user.constructiveCriticism).toBe(true);
    expect(userStore.user.experimentalTargetFace).toBe(false);
    expect(userStore.user.knockColor).toBe("#FF0000");
  });

  it("should calculate default season dates based on current date", () => {
    // Proper way to mock Date in Vitest
    const RealDate = global.Date;

    // January 15, 2023 test
    const mockJanDate = new Date(2023, 0, 15);
    global.Date = class extends RealDate {
      constructor(...args) {
        if (args.length === 0) {
          return mockJanDate;
        }
        return new RealDate(...args);
      }

      static now() {
        return mockJanDate.getTime();
      }
    };

    const userStore = useUserStore();
    userStore.resetSeasonDates();

    // For January 2023, indoor should be Oct 1, 2022 and outdoor should be Apr 1, 2023
    expect(userStore.user.indoorSeasonStartDate).toBe("2022-10-01");
    expect(userStore.user.outdoorSeasonStartDate).toBe("2023-04-01");

    // November 15, 2023 test
    const mockNovDate = new Date(2023, 10, 15);
    global.Date = class extends RealDate {
      constructor(...args) {
        if (args.length === 0) {
          return mockNovDate;
        }
        return new RealDate(...args);
      }

      static now() {
        return mockNovDate.getTime();
      }
    };

    userStore.resetSeasonDates();

    // For November 2023, indoor should be Oct 1, 2023 and outdoor should be Apr 1, 2023
    expect(userStore.user.indoorSeasonStartDate).toBe("2023-10-01");
    expect(userStore.user.outdoorSeasonStartDate).toBe("2023-04-01");

    // Restore the original Date
    global.Date = RealDate;
  });
});
