# Notes for cody about this application

## Purpose

When archers are shooting, they need to calculate their scores to submit to the records officer. This involves some
arithmetic which just isn't fun, so this app takes care of it. The way to calculate the scores also depends on the type
of game or "round" they play, which this app also takes care of.

In addition, it is there to store an archer's scores so they can monitor their progress. Archers hope to achieve
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

## Some TDD principles

- "Write the test you want to see". We should not write badly written tests due to the code under test being poorly
  written. I had an example where i asked you to write a test for a function, that failed when a parameter wasn't sent.
  This parameter was logically not needed for this test and was optional, but you suggested adding the parameter to all
  the tests. I had to correct you, and instead fix the production code to not need the parameter. In short, if tests are
  complicated to write, I'd rather you suggest ways to improve the design of the code under test.

## JavaScript

- I prefer functional programming, pure functions, and immutable data.
- Const over let.
- I like to have functions that are small and focused.
- I expect us to think about the "API" of our domain, to not expose unnecessary details, keep things private when
  possible.
- I prefer to have public functions at the top of the file, and private functions at the bottom.

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
