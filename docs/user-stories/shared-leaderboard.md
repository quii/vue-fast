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

## Implementation Milestones

For each step we should have automated tests. 

1. Core data models and state management for shoots. Please re-use models like HistoryItem. 
2. Backend API endpoints and Redis integration
3. WebSocket communication layer
4. UI components for creating and joining shoots
5. Leaderboard display component
6. QR code generation and scanning
7. Integration with the existing scoring flow
8. Notification system for leaderboard events- Users implicitly opt-in to sharing their scores by joining a shoot- They should only last a certain amount of time, perhaps to the end of the current day