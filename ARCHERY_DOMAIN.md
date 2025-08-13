# Archery Domain Knowledge

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

## Example rounds and rules

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