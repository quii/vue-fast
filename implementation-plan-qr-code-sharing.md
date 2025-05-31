# QR Code Sharing Implementation Plan

## Overview
Enable archers to share their live leaderboard sessions via QR codes that others can scan to join, even without the app installed.

## Features to Implement

### 1. Query String Parameter Handling
- **File**: `src/Leaderboard.vue`
- **Goal**: Accept `joincode` parameter from URL query string
- **Tasks**:
  - Add Vue Router query parameter detection in `onMounted`
  - Auto-populate join form when `joincode` is present
  - Handle invalid/expired codes gracefully
  - Preserve existing user flow for manual entry

### 2. QR Code Generation Component
- **File**: `src/components/ui/QRCodeGenerator.vue` (new)
- **Goal**: Generate QR codes for sharing
- **Tasks**:
  - Install QR code library (`qrcode` npm package)
  - Create reusable QR code component
  - Accept URL as prop
  - Render QR code as canvas/SVG
  - Add error handling for generation failures

### 3. Share Button in Top Bar
- **File**: `src/Leaderboard.vue`
- **Goal**: Add share functionality when in active shoot
- **Tasks**:
  - Add share icon component (`ShareIcon.vue`)
  - Add share button to `actionButtons` computed property
  - Only show when user is shoot creator or has share permissions
  - Handle share action in `handleTopBarAction`

### 4. Share Modal Component
- **File**: `src/components/modals/ShareModal.vue` (new)
- **Goal**: Display QR code and sharing options
- **Tasks**:
  - Create modal with QR code display
  - Show shareable URL text
  - Add copy-to-clipboard functionality
  - Include instructions for joining
  - Add close/cancel functionality

### 5. URL Construction Logic
- **File**: `src/utils/sharing.js` (new)
- **Goal**: Generate proper sharing URLs
- **Tasks**:
  - Create function to build share URLs
  - Handle different environments (dev/prod)
  - Include necessary parameters (joincode, optional game type)
  - Validate URL format

### 6. Share Icon Component
- **File**: `src/components/icons/ShareIcon.vue` (new)
- **Goal**: Consistent share icon
- **Tasks**:
  - Create SVG-based share icon
  - Match existing icon style/sizing
  - Ensure accessibility

## Implementation Steps

### Step 1: Query String Parameter Handling
- Modify `onMounted` in `src/Leaderboard.vue`
- Add URL parameter detection
- Auto-trigger join flow when code present
- Test with manual URL entry

### Step 2: Install and Setup QR Code Library
- Install `qrcode` npm package
- Create basic QR code component
- Test QR generation with sample URLs

### Step 3: Create Share Icon Component
- Design and implement share icon
- Ensure consistency with existing icons
- Add to icon exports if needed

### Step 4: Add Share Button to Top Bar
- Modify `actionButtons` computed property
- Add share action handling
- Implement modal state management

### Step 5: Create Share Modal Component
- Build modal with QR code display
- Add URL display and copy functionality
- Include user instructions
- Style consistently with existing modals

### Step 6: Create URL Construction Utility
- Build sharing URL generator
- Handle environment detection
- Add validation and error handling

### Step 7: Integration and Testing
- Connect all components together
- Test end-to-end flow
- Handle edge cases (expired codes, network issues)
- Test on mobile devices

### Step 8: Polish and UX Improvements
- Add loading states
- Improve error messages
- Add success feedback for copying
- Optimize QR code size for mobile scanning

## Technical Considerations

### Dependencies
- `qrcode` - QR code generation
- Existing Vue Router for query params
- Existing modal patterns

### Browser Compatibility
- Clipboard API for copy functionality
- Canvas support for QR rendering
- Mobile camera QR scanning (external)

### Security
- Validate join codes server-side
- Rate limiting for join attempts
- Sanitize URL parameters

### Performance
- Lazy load QR generation
- Cache generated QR codes
- Optimize QR code size vs. scannability

## File Structure
```
src/
├── components/
│   ├── icons/
│   │   └── ShareIcon.vue (new)
│   ├── modals/
│   │   └── ShareModal.vue (new)
│   └── ui/
│       └── QRCodeGenerator.vue (new)
├── utils/
│   └── sharing.js (new)
└── Leaderboard.vue (modified)
```

## Testing Checklist
- [ ] URL with valid join code auto-populates form
- [ ] URL with invalid join code shows error
- [ ] QR code generates correctly
- [ ] QR code scans to correct URL
- [ ] Copy to clipboard works
- [ ] Share button only shows for appropriate users
- [ ] Modal opens/closes correctly
- [ ] Mobile responsive design
- [ ] Works across different browsers
- [ ] Handles network failures gracefully