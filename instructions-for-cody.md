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

## Component Design Principles

- When a component needs magic numbers (like -1) or boolean flags to handle different modes, it's a signal to split it
  into more focused components
- Large numbers of props often indicate a component is doing too much and should be split
- Prefer creating separate components with clear, single responsibilities over one component that handles multiple modes
  through props
- Example: Rather than one target face component that handles both scoring and viewing, create:
  - A pure presentational target face component
  - A scoring wrapper for active shooting
  - A display wrapper for history viewing

This approach leads to cleaner interfaces, less prop drilling, and components that are easier to test and maintain.

## Dependency Design for Components

We follow a ports and adapters (hexagonal architecture) approach to keep our components decoupled from implementation details:

### Port Interfaces

- Define abstract interfaces in `src/domain/ports/` (like `sharing.ts`) that specify what functionality is needed
- These interfaces focus on the "what" not the "how" - they define the contract without implementation details
- Example: `SharingPort` defines methods like `generateScoresheet`, `shareScoresheet`, etc.

### Adapters (Implementations)

- Create concrete implementations in `src/domain/adapters/` that fulfill the port interfaces
- Browser-specific implementations go in `src/domain/adapters/browser/`
- Example: `BrowserSharingService` implements `SharingPort` using browser APIs

### Testing with Fakes

- Create fake implementations in `src/domain/adapters/in-memory/` for testing
- These fakes implement the same interface but with simplified behavior
- Example: `FakeSharingService` implements `SharingPort` with tracking for test assertions
- This approach is aligned with the guidance from "Learn Go with Tests"

### Component Integration

- Components should depend on the abstract interface, not concrete implementations
- Use Vue's dependency injection system with `provide`/`inject`
- Components inject the dependency using the interface type
- Example: `const sharingService = inject('sharingService')` in a component

### Wiring Dependencies

- The real implementations are wired up in `src/createApp.ts` or `src/main.ts`
- This keeps the application shell responsible for dependency configuration
- Example: `app.provide('sharingService', new BrowserSharingService())`

### Benefits

- Components remain focused on UI concerns, not implementation details
- Domain logic stays in the domain layer
- Testing is simplified with fake implementations
- We can swap implementations without changing components
- The application is more maintainable and adaptable to change

This approach creates a clean separation between:
1. What needs to be done (ports)
2. How it's done (adapters)
3. How it's presented (components)

## Some TDD principles

- "Write the test you want to see". We should not write badly written tests due to the code under test being poorly
  written. I had an example where i asked you to write a test for a function, that failed when a parameter wasn't sent.
  This parameter was logically not needed for this test and was optional, but you suggested adding the parameter to all
  the tests. I had to correct you, and instead fix the production code to not need the parameter. In short, if tests are
  complicated to write, I'd rather you suggest ways to improve the design of the code under test.
- New test cases should be added inside existing describe blocks, not outside them, to maintain proper test organization
  and scoping
- In domain, the unit tests live in the same directory as the file under test. There is no separate test folder.

## Dependency Injection and Testing Approach

We use the factory function pattern to enable dependency injection in our domain code without relying on global mocks.
This approach maintains a clean public API while making testing straightforward.

### Factory Function Pattern

```typescript
// Create a factory function that accepts dependencies with defaults
export function createSomeFunction(dependency = defaultDependency) {
  // Return the actual function with the dependency pre-configured
  return function actualFunction(param1, param2) {
    // Use the injected dependency inside
    return dependency.doSomething(param1, param2);
  };
}

// Export a pre-configured instance for normal use
export const someFunction = createSomeFunction();
```

### Testing With Factory Functions

```typescript
import { createSomeFunction } from '@/domain/some_module';

describe('someFunction', () => {
  test('works with test dependencies', () => {
    // Create a fake dependency for testing
    const testDependency = {
      doSomething: () => 'test result'
    };
    
    // Create a test-specific instance with the fake dependency
    const someFunction = createSomeFunction(testDependency);
    
    // Test using the configured function
    expect(someFunction('input')).toBe('test result');
  });
});
```

### Benefits

- **No Global Mocks**: Avoids jest.mock() and other global mocking approaches
- **Explicit Dependencies**: Dependencies are clearly visible in the code
- **Simple API**: Vue components can still import and use functions directly
- **Testable**: Domain logic can be tested in isolation with controlled dependencies
- **Framework Agnostic**: Domain code remains pure and not tied to Vue or any framework

This approach aligns with our preference for functional programming, pure functions, and explicit dependencies while
maintaining a clean public API for our Vue components.

## End-to-end Testing Workflow

- Page objects live in cypress/pages and encapsulate all the ways to interact with a page
- Each page object should have methods for:
  - Navigation to the page
  - Actions users can take (clicking buttons, filling forms etc)
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

The shortest round (and thus, good for tests where we don't care about the specific round) is a "Bray I".

This round is an indoor metric round, with no Xs. It has two and a half dozen rounds of shooting. With respect to
classifications, given a senior, recurve male archer, here are the following scores required to reach each
classification:

- A3: 134
- A2: 172
- A1: 205
- B3: 232
- B2: 252
- B1: 268
- MB: 280
- GMB: 289

## Archery Scoring Rules

1. End sizes vary by round type:

- Outdoor rounds (like National): 6 arrows per end
- Indoor rounds (like Bray I): 3 arrows per end

2. Within an end, scores must be entered in descending order. Once a score is entered (e.g., 7), you cannot enter a
   higher score (e.g., 9) in that end
3. When a new end begins, the archer can start scoring from the highest possible score again
4. Different rounds have different valid scores (e.g., National rounds use odd numbers)
5. Miss (M) is always a valid score option
6. Scores are entered from highest to lowest as the archer works their way out from the center of the target

## Target Face Rules

1. Standard target faces:

- Colors from center outwards: gold, red, blue, black, white
- Some rounds include an X ring in the center of the gold (counts as 10)
- X counts as a tiebreaker in competitions

2. Worcester target faces:

- Center ring is white
- All other rings are black
- Different scoring system from standard faces

## Component Creation Guidelines

- When adding new functionality that introduces a distinct visual element or interaction pattern, prefer creating a new
  component rather than extending an existing one
- Consider component separation when:
  - A new "visual thing" is being added to a page
  - The addition would significantly increase the complexity of an existing component
  - The functionality might be reused elsewhere in the application
  - The change introduces a new interaction model (like a modal, dropdown, etc.)
- Breaking changes into separate components helps with:
  - Maintaining single responsibility principle
  - Keeping code more readable and maintainable
  - Managing token limitations in responses
  - Simplifying testing
  - Enabling easier reuse across the application
- Even for seemingly small additions, consider whether they represent a distinct UI concept that deserves its own
  component
- When in doubt about whether to extend an existing component or create a new one, prefer creating a new component

## TypeScript Migration Strategy

When converting JavaScript domain code to TypeScript with stronger type guarantees, follow these principles:

### Preserve Public APIs

- **Maintain backward compatibility** with existing interfaces when adding types to domain code
- Public function signatures should remain unchanged initially, even if the internal implementation uses more
  sophisticated types
- Add type definitions that accommodate both old and new calling patterns where possible

### Adapter Pattern for Gradual Migration

- Use adapter functions or wrapper methods to convert between legacy data structures and new typed structures
- Create internal helper functions that handle the conversion logic, keeping it DRY
- Consider using TypeScript's union types to explicitly model the transition state (e.g.,
  `type Distance = number | DistanceObject`)

### Incremental Adoption

- Refactor one component at a time to use the new typed interfaces
- Update tests first to use the new interfaces, ensuring the domain logic works correctly with the new types
- Only remove support for legacy formats after all consumers have been updated

### Example Migration Pattern

1. **Phase 1**: Add types while maintaining the same API
   ```typescript
   // Before: function estimateSightMark(marks, targetDistance, targetUnit)
   // After:
   function estimateSightMark(
     marks: Array<LegacySightMark | TypedSightMark>, 
     targetDistance: number | Distance, 
     targetUnit?: DistanceUnit
   ): SightMark | null {
     // Internal conversion to typed structures
     const typedMarks = marks.map(convertToTypedSightMark);
     const typedDistance = convertToDistance(targetDistance, targetUnit);
     
     // Core logic using typed structures
     // ...
     
     // Return in a format compatible with existing code
     return result;
   }
   ```

2. **Phase 2**: Update consumers one by one to use the new typed API directly

3. **Phase 3**: Once all consumers are updated, simplify the API to use only typed structures
   ```typescript
   function estimateSightMark(
     marks: Array<TypedSightMark>, 
     targetDistance: Distance
   ): SightMark | null {
     // Clean implementation with no conversion needed
     // ...
   }
   ```

This approach minimizes disruption while gradually improving type safety throughout the codebase.

## Component Composition and Styling Principles

### Composition Over Custom Styling

- **Always prefer composition of existing UI components over custom styling**
- When creating new components or modals, first check if there are existing components that can be leveraged
- Strive for zero custom CSS in higher-level components like pages and modals
- Create small, focused UI components that can be composed together to build more complex interfaces

### UI Component Hierarchy

1. **Base Components**: Low-level, highly reusable UI elements (BaseButton, BaseModal)
2. **Layout Components**: Components that handle specific layout patterns (ButtonGroup, ButtonStack)
3. **Feature Components**: Domain-specific components that compose base and layout components
4. **Page Components**: Top-level components that primarily compose other components with minimal custom styling

### Signs You Need a New Component

- When you find yourself writing the same CSS patterns repeatedly
- When a layout pattern appears in multiple places (like stacked buttons in modals)
- When you need to add custom CSS to a component that should be simple

### Example: Modal Pattern

Modals should:

- Use BaseModal for consistent container styling
- Compose existing UI components for their content
- Have minimal to zero custom CSS
- Use ButtonGroup for horizontal button layouts
- Use ButtonStack for vertical button layouts

### Benefits of This Approach

- **Consistency**: UI elements look and behave the same across the application
- **Maintainability**: Changes to styling can be made in one place
- **Readability**: Component templates clearly show the structure without being cluttered by styling details
- **Reusability**: Components can be easily reused in different contexts
- **Scalability**: New features can be added quickly by composing existing components

When creating new components, always ask: "Can this be built by composing existing components?" before adding custom
CSS.

## Page Structure and Component Reuse Guidelines

### Page Structure

- All new pages should follow the same look and feel as existing pages like `src/ScoreHistory.vue` and
  `src/ScoreCard.vue`
- Typically, a page should have:
  - A `BaseTopBar` component at the top for actions and key information display
  - Content sections below that follow the established visual patterns
  - Consistent spacing and layout matching existing pages

### Component Reuse and Zero-CSS Approach

- **New pages or sections should require NO custom CSS**
- Always compose pages from existing components rather than writing new markup with custom styles
- Before implementing any feature, ask for a list of available components that might serve your needs
- For UI elements, check if we have components like:
  - `BaseButton`, `ButtonGroup`, `BaseTopBar`, `SectionCard`, etc.
  - Specialized components for common patterns in the application
- If you believe custom CSS is needed, first prompt me to confirm there isn't an existing component
- The goal is to maintain a consistent look and feel through strict component reuse
- Creating new CSS should be considered a last resort and requires explicit approval

### Icons

- **Never use inline SVG in templates**
- Always create dedicated icon components in `src/components/icons/`
- Before creating a new icon, ask for a list of existing icons:
  ```bash
  ls src/components/icons
  ```
- When using icons in components like `BaseTopBar`, always use the `iconComponent` prop with a component reference, not
  the `icon` prop with HTML strings

### Code Style

- No docstrings - TypeScript types should provide sufficient documentation
- Avoid comments unless necessary to explain where code should be inserted
- In domain code, design functions to take required parameters:
  - Handle optionality at the boundaries of the application, not in domain code
  - Avoid nullable parameters in domain functions when possible
  - Push null/undefined handling to the outer shell of the application

### Component Design

- Prefer smaller, focused components over larger multi-purpose ones
- When a component needs different modes or behaviors, consider splitting it into multiple components
- Follow the established patterns for component composition and props
- Reuse existing layout components rather than creating custom layouts

## Test Writing Principles

- Tests should be self-describing without comments. The test code itself should clearly express what's being tested.
- Always add type annotations to variables declared with `let` or `const` in tests for better type safety and readability.
- Page objects should not contain assertions. They should provide methods to query the state of the page, and the tests should make assertions based on those queries.
- Follow the "Arrange, Act, Assert" pattern in tests, but without explicit comments marking these sections.
- Test names should clearly describe the behavior being tested, using the "when/then" or "given/when/then" format.
- Prefer specific assertions over generic ones. For example, prefer `expect(value).toBe(expected)` over `expect(value).toBeTruthy()`.
- Keep test setup code minimal and focused on what's relevant to the specific test.
- Use beforeEach for common setup, but keep test-specific setup within the test itself.
- When testing async code, always use `async/await` rather than callbacks or promise chains.
- Page objects should represent the UI and provide methods to interact with it, but they shouldn't contain assertions themselves.

## Test Assertion Principles

- Use custom matchers to make assertions more readable and provide better error messages
- Prefer `expect(await page.element()).toHaveState()` over `expect(await page.hasState()).toBe(true)`
- Custom matchers should provide descriptive error messages that include:
  1. What element was being tested
  2. What state was expected
  3. What state was actually found
- Page objects should return element objects that can be used with custom matchers
- This approach makes tests more readable and provides better error messages when tests fail

### Example of improved assertions:

```typescript
// Instead of this:
expect(await page.isButtonEnabled('9')).toBe(false)

// Use this:
expect(await page.button('9')).toBeDisabled()
```

This approach makes tests more readable and provides better error messages when tests fail, such as:
"Expected button '9' to be enabled, but it was disabled"

### Example of a well-written test:

```typescript
it('disables higher score buttons after scoring a lower value', async () => {
  const page: ScorePage = new ScorePage(wrapper)
  await page.selectGame('Windsor')
  
  await page.score(7)
  
  expect(await page.isButtonDisabled('9')).toBe(true)
  expect(await page.isButtonEnabled('7')).toBe(true)
})
```

Notice how:
1. The test name clearly describes the behavior
2. Variables have type annotations
3. The test follows a clear structure without needing comments
4. The page object provides query methods, not assertions

## Shared Code Import Conventions

When working with code in the `shared` directory, which is used by both client and server:

### Use explicit file extensions in imports

For all imports within the shared code, always include the `.js` extension (not `.ts`), even though you're importing TypeScript files:

```typescript
// Correct:
import { Shoot } from '../models/Shoot.js';

// Incorrect:
import { Shoot } from '../models/Shoot';
import { Shoot } from '../models/Shoot.ts';
```

### Why this is necessary

1. The `shared` directory uses `"moduleResolution": "NodeNext"` in its tsconfig.json, which follows the ECMAScript modules specification
2. ECMAScript modules require explicit file extensions in relative imports
3. We use `.js` (not `.ts`) because TypeScript compiles to JavaScript, and the import statements refer to the compiled output
4. This approach ensures compatibility with both browser and Node.js environments

### Avoid path aliases in shared code

While the Vue application may use path aliases like `@/components`, avoid using these in shared code:

```typescript
// Don't use in shared code:
import { Something } from '@/models/Something';
```

Path aliases are specific to the project configuration and can cause issues when the shared code is used in different contexts (client vs server).

### Use relative imports consistently

Always use relative imports in shared code to maintain clarity about dependencies:

```typescript
// From shared/services/SomeService.ts importing shared/models/Something.ts
import { Something } from '../models/Something.js';
```

This approach ensures the shared code remains portable and can be used in different environments without configuration changes.5. The test makes assertions based on the page object's responses