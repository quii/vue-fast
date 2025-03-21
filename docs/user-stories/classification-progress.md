# Next classification progress bar

On the history page, if the data is available, we want to show the user a progress bar denoting how close they are to
achieving the next classification. The left-hand end of the progress bar should show their current classification, then
a progress bar, which shows N of the dozen arrows they have scored towards the next classification. The rules of how
many arrows they need to score, and what qualifies are described below.

## Rules

Remember our overall rules around code. I expect all of this complexity to be hidden from Vue, it instead calls
functions in our domain, simply providing the user data required. Of course, I expect this domain code to be unit
tested. I would also expect this progress bar component to be a separate vue component that we import into the history
page and pass whatever data is required.

There are separate classifications for indoor and outdoor, but currently, we only prompt the user for one. This will
need updating

For a "qualifying shoot for the next classification", they need to score a round to the standard they aim for.

For instance, if I am A1 (archer first class) for indoors, to get to the following classification (B3), I need to shoot
15 dozen arrows in total to that standard.

To understand this right now, I can look at the history, and I can see the classifications that were rated B3. But I
have to know that a Bray I is 2.5 dozen arrows, and a Portsmouth is 5 dozen, and then do the sorting and arithmetic
myself.

An archer may shoot with multiple bow types. In this case, we should have N progress bars, for each bow type. We should
update the user settings in the case where the user has recorded multiple bow types to enter a classification for each
bow type. Remember in history we store the bow type used, so we should be able to infer what bow types the user shoots
with.

### Indoor

https://archerygb.org/resources/indoor-classifications-and-handicaps

Archer tier - 10 dozen arrows
Bowmen tier - 15 dozen arrows
Master bowmen - also 15 dozen arrows but must be scored at a record status comp

### Outdoor

https://archerygb.org/resources/outdoor-classifications-and-handicaps

Archer tier - 12 dozen arrows
Bowmen tier - 18 dozen arrows
Master bowmen tier - 36 dozen arrows must occur at record status shoots

### When are the seasons?

There is some misalignment between AGB and what a club might do, so it's probably worth having a way for the user to
input start and end dates for the seasons, with defaults set to whatever AGB has

> As for seasons there are AGB seasons though they do differ from the club ones, the outdoor season runs from 1st
> January - 31st December whereas the club runs it 1st April - 31st Sept and winter i can't remember the dates for but if
> you by calendar year that will allign with agb more than the club which is probably best.

## Implementation

Same requirements for indoor|outdoor

### In the settings page

- Allow archer to set classification for both indoor and outdoor
- Allow archer to set a start date for both seasons

### In the history page

If the archer has entered a current classification for indoor|outdoor, and a date for the start of the current
indoor|outdoor season, calculate what the _next_ classification is, and count how many qualifying shoots the archer has
done so far to figure out how much the progress bar should be filled, display it.

### Other notes

- There is already a function which can calculate the next classification

## Implementation plan

1. User Store and Settings Updates
   First, we need to modify the user store to handle:

Indoor and outdoor season start dates
Classifications for different bow types (not just a single classification)
The user store should store:

indoorSeasonStartDate and outdoorSeasonStartDate
A map of classifications by bow type for both indoor and outdoor

2. UserData.vue Updates
   We'll update the UserData.vue to:

Allow setting season start dates
Show and manage classifications for each bow type the archer has used
Detect bow types from history

3. Classification Progress Component
   Create a component that shows:

Progress toward next classification for a specific bow type and environment (indoor/outdoor)
Current classification, next classification, and progress bar

4. Domain Logic for Classification Progress
   Add functions to:

Determine which bow types an archer has used
Calculate progress for each bow type and environment
Filter qualifying shoots based on bow type, environment, and season dates
Integration with ScoreHistory.vue

5. ScoreHistory.vue Updates
   Show multiple progress bars in ScoreHistory.vue, one for each bow type and environment combination.