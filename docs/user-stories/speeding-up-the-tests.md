# Speeding up the build

## Introduction

We have lost our test pyramid approach. We have a number of cypress browser tests which we need to push down the
pyramid. We still need the cypress tests for key use cases, but we should be able to replace the rest of them with a new
set of tests.

I want us to introduce a new set of acceptance tests which will mount the entire application using Vue Test Utils.

### Principles

- We must not mock any behaviour belonging to the application.
- The only things we can mock are external things, like localstorage, window, and so on.
- For public folder assets (like classification data in `public/data/classifications/Men/Recurve/Senior.json`), we'll create a simple web server that serves these files during tests.
- These acceptance tests should follow a similar pattern to the cypress tests, using page objects to control the application.

I have made a folder `src/components/__tests__/acceptance` where I expect the test harness, page objects, and various tests to live.

### Refactoring Requirements

Our `src/main.ts` needs refactoring to separate the app creation from app mounting, so we can mount the application in our test environment. The refactoring should:

1. Extract the app creation logic into a reusable function
2. Keep the router creation (from `src/routes.ts`) accessible for tests
3. Ensure all event listeners and plugins are properly initialized in tests

### Test Environment Setup

For our test environment, we should:

1. Create a base test harness that mounts the full application
2. Mock localStorage to prevent the need to dismiss first-time modals and set up the user profile
3. Create page objects similar to our Cypress page objects but adapted for Vue Test Utils

Here's an example of how we might set up localStorage for tests:

```typescript
  // Set up a default user profile in localStorage
const defaultUserProfile = {
  "ageGroup": "senior",
  "gender": "male",
  "bowType": "recurve",
  "indoorClassifications": { "recurve": "Unclassified" },
  "outdoorClassifications": { "recurve": "Unclassified" },
  "indoorSeasonStartDate": "2025-10-01",
  "outdoorSeasonStartDate": "2025-04-01",
  "name": "Test Archer",
  "constructiveCriticism": true,
  "experimentalTargetFace": false,
  "knockColor": "#FF69B4",
  "lastBackupDate": "2025-05-03T16:35:23.800Z"
}

mockStorage.setItem('user', JSON.stringify(defaultUserProfile))

// Disable all tips
mockStorage.setItem('hasSeenPrintTip', 'true')
mockStorage.setItem('hasSeenHistoryTip', 'true')
mockStorage.setItem('hasSeenRoundSelectionTip', 'true')
mockStorage.setItem('hasSeenScoreCardTutorial', 'true')
mockStorage.setItem('hasSeenInstallPrompt', 'true')
```

## Example Test to Replace

The score_buttons test, found at `cypress/e2e/score_buttons.cy.ts` is a good example of a test that we can start to
replace. All it does is choose rounds and verifies the correct score buttons and validation around them act correctly.
It uses the page object found here `cypress/pages/scorePage.ts`

## Implementation plan

Please, don't skip steps. Do one step, and then wait for me to check things before moving on. If you can think of a way
of breaking a step down into smaller ones, feel free to suggest.

### Step 1
First, refactor the `src/main.ts` file to separate app creation from app mounting. This should:
- Create a function that returns the configured Vue app without mounting it
- Ensure the router is accessible for tests
- Make sure all event listeners and plugins are properly initialized

### Step 2
Create a test harness in `src/components/__tests__/acceptance/testHarness.ts` that:
- Mounts the full application using Vue Test Utils
- Sets up localStorage mocking
- Provides a way to serve public folder assets
- Creates a base page object structure

Implement a score page object in `src/components/__tests__/acceptance/pages/scorePage.ts` that:
- Mirrors the functionality of the Cypress page object but uses Vue Test Utils methods
- Provides methods to interact with the score buttons and verify their state

### Step 4
Create a test file `src/components/__tests__/acceptance/scoreButtons.test.ts` that:
- Uses the test harness and score page object
- Implements a simple test case: "Given I select Windsor as a round, When I tap the 7 score button, Then the 9 score button should be disabled"Then then 9 score button should be disabled