# Notes for cody about this application

## Purpose

When archers are shooting, they need to calculate their scores to submit to the records officer. This involves some
arithmetic which just isn't fun, so this app takes care of it. The way to calculate the scores also depends on the type
of game or "round" they play, which this app also takes care of.

The typical workflow is
- Archer choose a round, such as "National", which defines how many arrows to shoot, at what distances.
- The archer shoots 6 arrows, this is described as an "end".
- The archer approaches the target, and checks which score each arrow achieved.
- They work from the centre (the highest score), tapping the number of the score into the app.
- The archer expects the total score of the end to be automatically calculated
- The archer repeats this process until the shoot is finished, and expects things like total hits, the end totals and grand totals to be automatically calculated
- Once the shoot is finished, they can save it into their records, to view later in their history

Archer store scores so they can monitor their progress over time. Archers hope to achieve
classifications and handicaps, both of which require relatively complex understanding and looking up of scores and
rules; this app also takes care of this complexity for the archer.

## Architecture

- This is a PWA, used by people on their mobile phones, typically in portrait. So we need to favour simple, mobile
  first UI and be sympathetic to network conditions and mobile phones that may not be very powerful.
- It should work offline once it is downloaded, this is why we favour local storage and not calling APIs to get data. An
  exception for this could be made for non-essential, value-add functionality.

## Code principles

- "Domain logic" should be kept out of the Vue code. We have a domain folder which should house any logic to do with
  processing data or making decisions. I expect the script tags in a vue component to only contain references to stores
  to manage data, and obviously local refs and functions to manipulate the UI. Computed refs are fine in simple cases,
  but if we find ourselves with complex computed refs, we should perhaps instead have this calculated in the domain.
- Domain logic should be written with pure, low-dependency JavaScript, completely decoupled from Vue. In theory we should be able to take this code into another framework with no changes to it
- We use pinia stores to manage state, which should use local storage to persist the data. Domain logic should also be
  separated from this code, and instead delegate to a class that takes the storage as a dependency to use. Take a look
  at src/domain/notes_manager.js for an example.
- We should be writing unit tests for all our domain logic.
- Our unit tests should have an idea of given/when/then, but they do not need to write comments to show this.
- End-to-end tests using cypress should keep in mind the test pyramid. We use these for smoke tests of key journeys,
  feel free to suggest cheaper unit tests to exercise other parts of the code.
- We use page objects with our end-to-end tests to simplify writing and reading them, and promote re-use
- When dealing with a chain of operations, prefer explicit, well-named intermediate variables over nested function
  calls. Each step should be clear and readable on its own line, showing the transformation of data through your
  program. This makes the code's intent obvious and easier to debug.
- Public methods should read like a high-level description of what the code does, not how it does it. For example,
  getFilteredHistory inside @player_history shows a clear sequence of filter operations being applied, while the
  implementation details of how each filter works live elsewhere. This separation makes the code's intent clear at each
  level - the public API tells a story of what happens, while the implementation details are encapsulated in well-named,
  focused functions.
  - This principle is exemplified in how getFilteredHistory reads like a clear set of steps (filterByPB, filterByRound,
    etc) while the actual filtering logic lives in the history_filters.js module.

## Some TDD principles

- "Write the test you want to see". We should not write badly written tests due to the code under test being poorly
  written. I had an example where i asked you to write a test for a function, that failed when a parameter wasn't sent.
  This parameter was logically not needed for this test and was optional, but you suggested adding the parameter to all
  the tests. I had to correct you, and instead fix the production code to not need the parameter. In short, if tests are
  complicated to write, I'd rather you suggest ways to improve the design of the code under test.
- New test cases should be added inside existing describe blocks, not outside them, to maintain proper test organization
  and scoping
- In domain, the unit tests live in the same directory as the file under test. There is no separate test folder.

## End-to-end Testing Workflow

- Page objects live in cypress/pages and encapsulate all the ways to interact with a page
- Each page object should have methods for:
  - Navigation to the page
  - Actions users can take (clicking buttons, filling forms etc)
  - Assertions about what should be visible
- End-to-end tests live in cypress/e2e and use page objects to create readable test scenarios
- Tests should verify complete user workflows rather than isolated features
- Follow the pattern from sight_marks.cy.js where we test the full lifecycle: create, edit, delete
- Keep page object methods focused and well-named to make test scenarios read like user stories
- When asserting elements don't exist, use cy.contains(selector, text).should('not.exist') rather than trying to assert
  on content that may never be found
- This pattern ensures Cypress properly handles non-existent elements without timing out

## JavaScript

- I prefer functional programming, pure functions, and immutable data.
- Const over let.
- I like to have functions that are small and focused.
- I expect us to think about the "API" of our domain, to not expose unnecessary details, keep things private when
  possible.
- I prefer to have public functions at the top of the file, and private functions at the bottom.
- I want consistency with respect to defining functions. Arrow functions are fine for small lambdas within functions, or
  for returning functions within a function, but for top-level, please prefer the function syntax
- Whilst we enjoy using pure functions to calculate things, sometimes we want to use JavaScript classes to encapsulate
  quering and managing state, usually with our Pinia stores. Don't make a function that returns an object with a bunch
  of methods, this is hard to read. Use a class.
- Functions should be separated by a blank line for readability, whether they are inside a class or at the module level

## CSS Principles

- Use relative units (vh, vw, rem) over fixed pixel values to ensure layouts adapt across different device sizes
- Favor viewport units (vh) for vertical measurements to maintain proportional sizing across different mobile screens
- Use rem units for typography and padding to maintain consistent spacing relative to root font size
- Keep layouts flexible using flex and relative sizing to accommodate varying screen dimensions
- Consider the full range of mobile viewport sizes when designing components
- Leverage the global styles defined in base.css and main.css for consistent theming
- Use CSS variables defined in base.css for colors, spacing, and other design tokens
- Only add component-specific styles in scoped blocks when the styling truly needs to be unique to that component
- Inherit global styles for common elements like buttons, inputs, and typography to maintain visual consistency
- Ensure all color-related styles use theme variables to support both light and dark modes
- Use var(--color-background), var(--color-text), var(--color-border) etc. instead of hardcoded colors
- Test components in both light and dark modes during development

## General rules around archery to keep in mind

- Round or gameType are used synonymously in the codebase due to historical knowledge changes, but the canonical word
  should be Round. A round is like a "game" an archer will play, which dictate how many arrows they have to shoot, at
  what distance(s), and what scores per arrow are possible.
- Archer's shoot "ends", which are typically 6 arrows, but indoors you tend to shoot 3 arrows at a time (twice, to make
  a total end). Depending on the gameType or round, what scores are available vary. Typically, imperial rounds have the
  odd numbers up to and including 9. Metric rounds have 1 to 10, and sometimes X (which is worth 10).
- A score of zero is a miss, denoted with an M
- A round will have a fixed number of ends, where the archer will score as high a total as they can. Some rounds will
  have multiple distances to shoot. For instance, a national is a round where the archer will shoot 8 ends at 60 yards,
  then 4 ends at 50 yards.
- When recording scores, they are grouped per end, and must be in order. In other words, in a given end, you cant score
  5, and then a 7 or 9, you can only score more 5s or lower. Once the archer goes to the next end, they can start at the
  maximum score again.
- Archers have the following properties, gender/sex, age, and bow type. Bow types are longbow, recurve, compound, or
  barebow.
- Archers are mainly trying to improve their ability, and this is measured via:
    - Improving their personal best for particular rounds
    - Attaining classifications
- Classifications, in order of prestige are "Grand Master Bowmen" (GMB), "Master Bowmen" (MB), "Bowmen 1st Class" (
  B1), "Bowmen 2nd Class" (B2), "Bowmen 3rd Class" (B3), "Archer 1st Class" (A1), "Archer 2nd Class" (A2), "Archer 3rd
  Class (A3)".
- To score a classification, they must reach a certain score threshold in a round. This score depends on the archer's
  properties. So their sex, age and bowtype determine what scores they need.

### Example rounds and rules

Imperial rounds have only odd numbered scores.

Metric rounds have 1 to 10, and sometimes X (which is worth 10).

The shortest round (and thus, good for tests where we don't care about the specific round) is a "Bray I". This round is
an indoor metric round, with no Xs. It has two and a half dozen rounds of shooting. With respect to classifications,
given a senior, recurve male archer, here are the following scores required to reach each classification:

- A3: 134
- A2: 172
- A1: 205
- B3: 232
- B2: 252
- B1: 268
- MB: 280
- GMB: 289