# Step 4: UI Components for Creating and Joining Shoots

## Overview
Add shared leaderboard functionality to the ScoreCard via the TopBar, replacing the low-utility "Max score" display with leaderboard functionality.

## Important Design Principles

### Component Reuse
- **Reuse existing UI components** - minimal to no new CSS
- Use `BaseModal.vue`, `ButtonGroup.vue`, `BaseButton.vue` extensively
- Adapt existing patterns from `NoteModal.vue`, `ShootEditModal.vue`
- Ask about shared components if unsure what's available

### Architecture
- **Use existing ports and adapters** from `shared/ports/ShootService.ts`
- Implement `ShootRepository` as HTTP client wrapper to backend API
- Follow dependency injection patterns established in codebase
- Maintain separation between domain logic and UI

## Mini Implementation Plan

### 4.1 Data Layer & State Management
- [ ] **Implement HTTP ShootRepository** (`src/services/HttpShootRepository.ts`)
  - Implement `shared/ports/ShootRepository.ts` interface
  - Wrap backend API calls (`/api/leaderboard/*`)
  - Handle HTTP errors and network issues
- [ ] **Create WebSocket notification service** (`src/services/WebSocketNotificationService.ts`)
  - Implement `shared/ports/ShootNotificationService.ts` interface
  - Handle WebSocket connection lifecycle
  - Integrate with shoot service for real-time updates
- [ ] **Create Pinia store** (`src/stores/shoot.ts`)
  - Use `ShootServiceImpl` with HTTP repository
  - Manage current shoot state and connection status
  - Reactive integration with existing stores

### 4.2 Core Modal Component
- [ ] **Create `LeaderboardModal.vue`** using `BaseModal.vue`
- [ ] Implement modal state management (show/hide)
- [ ] Add conditional content rendering based on shoot participation
- [ ] Use existing modal patterns for consistency

### 4.3 Create/Join Shoot UI
- [ ] **Create `CreateShootForm.vue`**
  - Use `BaseButton.vue` and `ButtonGroup.vue`
  - Minimal custom styling, leverage existing form patterns
  - Integration with shoot service
- [ ] **Create `JoinShootForm.vue`** 
  - Text-based 4-digit code entry
  - Use existing input styling patterns
  - Form validation using existing patterns
- [ ] Add error handling using existing toast/notification system

### 4.4 Leaderboard Display
- [ ] **Create `LeaderboardDisplay.vue`**
  - Adapt `HistoryCard.vue` styling for leaderboard entries
  - Use existing card/list component patterns
  - Show: archer name, round, running total, position
- [ ] **Add leave shoot functionality**
  - Use `BaseButton.vue` with danger variant
  - Confirmation pattern similar to existing modals

### 4.5 TopBar Integration
- [ ] **Modify `TopBar.vue`**
  - Remove "Max score" display logic
  - Add leaderboard button using existing button patterns
  - Update `actionButtons` computed property
  - Use appropriate icon (ask about existing icon components)

### 4.6 ScoreCard Integration
- [ ] **Modify `ScoreCard.vue`**
  - Add `LeaderboardModal` component
  - Inject shoot service using dependency injection patterns
  - Connect to existing scoring flow via `scoresStore`
  - Handle WebSocket lifecycle (connect/disconnect)

### 4.7 Service Integration & Dependency Injection
- [ ] **Set up dependency injection** (likely in `main.ts` or similar)
  - Create HTTP repository instance
  - Create WebSocket service instance  
  - Create shoot service with dependencies
  - Provide to Vue app for injection
- [ ] **Type-safe injection in components**
  - Use TypeScript interfaces for injection
  - Follow existing patterns in codebase

### 4.8 Error Handling & Edge Cases
- [ ] Leverage existing error handling patterns
- [ ] Use existing toast notification system
- [ ] Handle loading states with existing patterns
- [ ] Graceful WebSocket disconnection/reconnection

### 4.9 Testing
- [ ] Unit tests using existing test patterns
- [ ] Mock shoot service for component tests
- [ ] Integration tests for HTTP repository
- [ ] E2E tests following existing Cypress patterns

## File Structure
```
src/
├── components/
│   ├── modals/
│   │   └── LeaderboardModal.vue (uses BaseModal)
│   ├── leaderboard/
│   │   ├── CreateShootForm.vue (uses BaseButton, ButtonGroup)
│   │   ├── JoinShootForm.vue (uses existing form patterns)
│   │   └── LeaderboardDisplay.vue (adapts HistoryCard styling)
│   └── TopBar.vue (modified)
├── services/
│   ├── HttpShootRepository.ts (implements ShootRepository port)
│   └── WebSocketNotificationService.ts (implements ShootNotificationService port)
├── stores/
│   └── shoot.ts (uses ShootServiceImpl)
└── ScoreCard.vue (modified)
```

## Questions for Existing Components
- What icon components are available for the leaderboard button?
- Are there existing form input components we should use?
- What loading/spinner components exist?
- Are there existing list/card components beyond HistoryCard?
- What's the established pattern for dependency injection in this codebase?

## Technical Decisions

### Repository Implementation
- HTTP repository will call `/api/leaderboard/*` endpoints
- Use existing HTTP client patterns from codebase
- Handle errors consistently with existing error handling

### Service Integration  
- Use `ShootServiceImpl` from shared layer
- Inject HTTP repository and WebSocket service
- Follow ports and adapters architecture strictly

### Component Architecture
- Minimal custom CSS - leverage existing design system
- Use composition API with existing store patterns
- Follow established modal and form patterns

## Success Criteria
- [ ] Proper separation of concerns via ports/adapters
- [ ] HTTP repository properly implements ShootRepository interface
- [ ] WebSocket integration follows existing service patterns
- [ ] No architectural shortcuts - proper dependency injection
- [ ] Consistent with existing codebase patterns and styling