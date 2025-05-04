# Speeding up the build

## Introduction

We have lost our test pyramid approach. We have a number of cypress browser tests which we need to push down the
pyramid. We still need the cypress tests for key use cases, but we should be able to replace the rest of them with a new
set of tests.

I want us to introduce a new set of acceptance tests which will mount the entire application using vue's testing
capabilities

### Principles

- We must not mock any behaviour belonging to the application.
- The only things we can mock are external things, like localstorage, window, and so on.
    - There are things like the public folder, which holds our classification information, which is fetched by the
      application, such as public/data/classifications/Men/Recurve/Senior.json. We'll need to find a way to mount the
      public server in a server the application can call.
- These acceptance tests should follow a similar pattern to the cypress tests, in that we use page objections to control
  the application.

I have made a folder src/components/__tests__/acceptance where i expect the test harness, and various tests to live.

### We may need to do some refactoring first.

I believe our `src/main.ts` may need refactoring. It contains our app component, and creates the router (fround at
`src/routes.ts`) plus other window listening events amongst other things. It may need refactoring so we can then mount
the application in our test.

### We can manipulate localstorage before our tests to prevent the need to dismiss first time modals, and also set up the user correctly.

Something like this should do it

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

## An example test that we can start to try and replace

The score_buttons test, found at cypress/e2e/score_buttons.cy.ts is a good example of a test that we can start to
replace. All it does is choose rounds and verifies the correct score buttons and validation around them act correctly.
It uses the page object found here cypress/pages/scorePage.ts

## Other information

We are already using vitest. Please check the config vitest.config.ts

## Implementation plan

Please, don't skip steps. Do one step, and then wait for me to check things before moving on. If you can think of a way
of breaking a step down into smaller ones, feel free to suggest.

### Step 1
I first want us to do the needed refactoring to get the main.ts file into a separate file so that we have all we need to
mount into the test. Assuming that doesn't break the app and all our tests pass, we go onto the next step.

### Step 2
The next step is to create enough of a test harness, and page object to run a very simple test.

Given I select Windsor as a round
When I tap the 7 score button
Then then 9 score button should be disabled