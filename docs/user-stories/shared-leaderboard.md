# Real-time shared leaderboard

## User Story

We have a number of archers using fast to track their scores. Often we want to compare how we are doing with other archer's we're shooting with. Right now, people have to ask, look at each other's phones, or the paper scoresheets. 

What if instead, fast users could somehow connect to a central "shoot", and as they complete ends, it updates a leaderboard. All players in the shoot can see who is shooting what round, what they've scored, and even have a leaderboard. 

## Technical ideas

We are hosted on fly.io, which offers redis. So we could store the state of a shoot in redis and have clients connect to it to send updates and receive the latest state of the leaderboard. Other real-time database solutions could also be considered, but Redis is supported by our hosting platform and suitable for ephemeral data.

We should be able to extend our existing backend API to support this.

I would expect the local experience to spin up redis in a docker container, which can also be used for testing.

For real-time updates, we'll implement WebSockets to ensure all connected archers receive immediate updates when scores change.

The data synchronization approach should be idempotent - each update will essentially "PUT" the archer's current shoot data (including individual scores, selected round, and profile information). With timestamped updates, this approach eliminates complex synchronization issues and handles offline scenarios gracefully when archers reconnect.

## User Experience

We already have components, cards to show scores, like @HistoryCard.vue. We can adapt this to instead show current score, along with the name of the archer.

The leaderboard will display:
- Archer's profile name (using the same identification system as the backup feature)
- The round they're shooting
- Their running total score
- Current on-track classification

We won't implement score locking or join/leave notifications in the initial version.

As an enhancement, we could implement device notifications for significant events (e.g., "Chris has taken the lead!") every 2 ends or so.

## How to make it easy for people to connect to a central game?

One archer should initiate the game. We then want a way for them to easily share the game so others can connect to it.

- Any archer can create a "shoot" (leaderboard session)
- Shoots will be protected with a simple 4-digit code (security isn't a major concern for this feature)
- Sharing will be done via QR code that others can scan to join the shoot
- Shoots will remain active until the end of the current day

## Other high level features and ideas

- Be able to share the result of a game, e.g like our @PrintModal.vue, but with a leaderboard
- Data is ephemeral and doesn't need to be retained after the shoot ends
- No chat/messaging functionality is needed in the initial implementation
- No additional sorting options beyond the default (by score) are required

## Testing Strategy

- Unit tests for the core shoot/leaderboard data models
- Integration tests for the Redis/WebSocket implementation
- End-to-end tests using Cypress to validate the complete user flow:
  - Creating a shoot
  - Joining a shoot via code
  - Scoring arrows and seeing updates on the leaderboard
  - Handling disconnections and reconnections
- Acceptance tests for the UI components using the existing test harness

## User stories

I expect these to be implemented as the domain layer of this feature. We should be able to unit test these cases, and they should be totally separate from accidental complexity like websockets, redis, and so on. Use fakes when needed, not stubs/spies.

1. As an archer, I want to create a shoot so that I can track my scores and compare them with others.
2. As an archer, I want to join a shoot (we will have to abstract the idea of QR code i think to an ID?) so that I can participate in a shared leaderboard.
3. Given there are 2 archers in a shoot, and 2 archers have reported their latest scores, i can see the leaderboard with the scores of both archers.
4. As an archer, I want to leave a shoot so that I can stop sharing my scores when I'm done. 
5. As an archer, I want to see when the leaderboard was last updated so I know if the data is current. 
6. As an archer, I want to be notified when I've moved up or down in rankings so I'm aware of my position changes.
7. As an archer, I want my shoot participation to persist across sessions so I can reconnect to an ongoing shoot without losing my place.
8. As an archer who created a shoot, I want it to be automatically deleted at the end of the day, so I don't have to manually delete it.


## Implementation Milestones

For each step we should have automated tests. We should remember to take a hexagonal, ports and adapters approach to this.

1. **Core data models and state management for shoots.** Please re-use models like HistoryItem. I would expect us to come up with some ports here that can conceptually drive a shoot, and its lifecycle. The other steps are more or less plugging in adapters for persistence, APIs and the UI. So I would expect most, if not all user stories to be done, with corresponding tests, operating using fakes for things like persistence and so on.

2. **Backend API endpoints and Redis integration (implement a driven, persistence adapter)** - This gives us a way to store and retrieve shoot data, which we can validate through API tests.

3. **WebSocket communication layer (implement a driving adapter)** - Combined with a simple test client, we can validate real-time updates are working.

4. **UI components for creating and joining shoots (a driving adapter)** - This should include a basic text-based code entry system for joining, not requiring QR codes yet. At this point, users can create and join shoots.

5. **Leaderboard display component (implement an adapter)** - This integrates with the existing scoring flow, allowing users to see the leaderboard updating as scores are entered. This is the first point where we have end-to-end functionality.

6. **QR code generation and scanning (implement an adapter)** - This enhances the joining experience but isn't required for core functionality.

7. **Notification system for leaderboard events** - This adds the enhancement for position change notifications.
8. Notification system for leaderboard events