# Cloud-Based Backup Implementation Plan

This document outlines our incremental approach to implementing the cloud backup feature. We'll work in small, testable
steps to ensure we can validate our progress and deploy working increments.

## Phase 1: Infrastructure Setup

### Step 1: Create Basic Server Structure

- Create a `server` directory in the project root
- Create a basic Express server in TypeScript:
    - `server/index.ts`: Main server file
    - `server/routes/api.ts`: API routes
    - `server/tsconfig.json`: TypeScript configuration

### Step 2: Update Package.json

- Add server dependencies:
    - Express
    - TypeScript
    - ts-node (for development)
    - nodemon (for auto-reloading)
    - AWS SDK for S3
    - concurrently (to run both frontend and backend in development)
- Add scripts:
    - `server:build`: Compile TypeScript to JavaScript
    - `server:dev`: Run server in development mode with auto-reloading
    - `dev:all`: Run both Vue app and server concurrently

### Step 3: Update Vite Configuration

- Modify `vite.config.js` to:
    - Configure the dev server to proxy API requests to the backend server
    - Update the PWA plugin configuration to exclude API routes from caching:
      ```javascript
      VitePWA({
        // Existing configuration...
        workbox: {
          // Existing configuration...
          navigateFallback: 'index.html',
          navigateFallbackDenylist: [/^\/api\//],
        },
      })
      ```

### Step 4: Create Hello World API

- Implement a simple GET endpoint at `/api/health` that returns:
  ```json
  {
    "status": "ok",
    "message": "Hello from the backup API!"
  }
  ```
- Add basic error handling middleware

### Step 5: Update Dockerfile for Production

- Modify the Dockerfile to:
    - Build the Vue app
    - Build the server
    - Run the server in production mode

### Step 6: Update fly.toml

- Update the `fly.toml` configuration:
    - Change the internal port to match our Node.js server (e.g., 8080)
    - Update build arguments if necessary
    - Ensure environment variables are properly configured

### Step 7: Test Deployment Locally

- Verify that both the Vue app and API server run correctly
- Confirm the API endpoint is accessible
- Verify the PWA still works as expected

### Step 8: Deploy to Fly.io

- Deploy and verify the application works in production
- Confirm the API endpoint is accessible in production

## Phase 2: Event System Integration

### Step 1: Create Backup Service

- Create a new service file `src/services/backupService.ts`
- Implement basic structure with placeholder methods:
  ```typescript
  export const backupService = {
    isEnabled() {
      return false; // Initially disabled
    },
    
    async scheduleBackup() {
      console.log('Backup scheduled');
      // Just log for now
    },
    
    async testConnection() {
      try {
        const response = await fetch('/api/health');
        return response.ok;
      } catch (error) {
        console.error('API connection test failed:', error);
        return false;
      }
    }
  };
  ```

### Step 2: Implement Event Emission

- Modify `src/stores/history.ts` to emit an event when a score is saved:
  ```typescript
  // After successfully saving a score
  window.dispatchEvent(new CustomEvent('archery-data-changed', { 
    detail: { type: 'score-saved' } 
  }));
  ```

### Step 3: Implement Event Listener

- Update `src/main.ts` to set up the event listener:
  ```typescript
  import { backupService } from './services/backupService';
  
  // Set up backup event listener
  window.addEventListener('archery-data-changed', (event) => {
    console.log('Data change detected:', event);
    if (backupService.isEnabled()) {
      backupService.scheduleBackup();
    }
  });
  ```

### Step 4: Add Basic UI Indicator

- Update `src/DataManagement.vue` to add a simple indicator:
  ```html
  <div v-if="installationStore.isStandalone" class="cloud-backup-status">
    <p>Cloud backup: Coming soon</p>
    <button @click="testConnection">Test API Connection</button>
  </div>
  ```
  ```javascript
  import { useInstallationStore } from '@/stores/installation';
  import { backupService } from '@/services/backupService';
  
  const installationStore = useInstallationStore();
  
  async function testConnection() {
    const isConnected = await backupService.testConnection();
    toast.info(isConnected ? 'API connection successful!' : 'API connection failed');
  }
  ```

### Step 5: Test End-to-End

- Verify the event is emitted when a score is saved
- Confirm the event listener logs the event
- Test the API connection button works

## Phase 3: S3 Integration

### Step 1: Set Up Local S3-Compatible Storage

- Add MinIO for local development instead of using Docker Compose
- Configure environment variables for local S3 connection
- Update the `dev:all` script to include MinIO while maintaining the existing developer experience

### Step 2: Implement S3 Service

- Create `server/services/s3Service.ts` with basic operations:
  - Initialize S3 client
  - Create bucket if not exists
  - Store and retrieve objects
  - List objects
  - Delete objects
- Implement metadata tagging for backups:
  - Tag each backup with user name
  - Tag each backup with device ID
  - Tag each backup with timestamp
- Structure S3 keys to support cross-device recovery:
  - Use format: `backups/{userName}/{deviceId}/{timestamp}.json`

### Step 3: Implement Basic Backup API

- Create POST endpoint `/api/backup/:deviceId`
- Create GET endpoint `/api/backup/:deviceId` (this should retrieve a list of backups by device ID)
- Store user name alongside backup data
- Implement basic validation
- Store the received data in S3 with appropriate metadata
- Return success/failure response
- Add a new endpoint `/api/find-backups?name={userName}` for cross-device recovery:
  - Allow users to find their backups by name
  - Return a list of backups across all devices for that user

### Step 4: Update Backup Service

- Enhance `backupService.scheduleBackup()` to:
  - Generate and store a stable device ID
  - Include user name in backup data
  - Collect data from stores
  - Send data to the API
  - Handle success/failure
  - Implement basic retry logic
- Add a new method `findBackupsByName(name)` to:
  - Search for backups by user name
  - Support recovery across different devices

### Step 5: Test Backup Flow

- Verify data is correctly sent to the API
- Confirm data is stored in S3 with proper metadata
- Test error handling
- Verify cross-device recovery works:
  - Create backups with different device IDs
  - Retrieve backups by user name
  - Restore from a backup created on a different device

## Phase 4: Complete Backup & Restore Functionality

### Step 1: Implement Backup Listing API

- Create GET endpoint `/api/backups/:deviceId`
- Return list of backups with timestamps

### Step 2: Implement Backup Retrieval API

- Create GET endpoint `/api/backup/:deviceId/:backupId`
- Return the requested backup data

### Step 3: Implement Backup Rotation

- Add logic to maintain only the 5 most recent backups
- Implement total backup count limit

### Step 4: Enhance UI in DataManagement.vue

- Add backup list display
- Implement manual backup button
- Add restore functionality
- Show backup status and errors

### Step 5: Implement Offline Support

- Enhance service worker to queue backup requests when offline
- Add logic to retry when connection is restored

### Step 6: Complete Testing

- Verify all functionality works locally
- Test with various network conditions
- Ensure PWA functionality is preserved

## Phase 5: Polish and Deploy

### Step 1: Add Rate Limiting

- Implement rate limiting middleware
- Configure appropriate limits

### Step 2: Enhance Error Handling

- Improve error messages
- Add logging
- Implement proper error responses

### Step 3: Optimize Performance

- Add caching where appropriate
- Optimize bundle sizes
- Ensure fast loading times

### Step 4: Final Testing

- Conduct end-to-end testing
- Verify all edge cases
- Test on multiple devices

### Step 5: Deploy to Production

- Deploy the final version to Fly.io
- Verify everything works in production
- Monitor for any issues

## Validation Criteria for Each Phase

### Phase 1

- Server runs locally
- API endpoint returns expected response
- Vue app continues to function normally
- Deployment to Fly.io works

### Phase 2

- Events are emitted when scores are saved
- Event listener logs events correctly
- API connection test works

### Phase 3

- Data is successfully stored in S3
- Error handling works as expected
- Backup service correctly collects and sends data

### Phase 4

- Backups are listed correctly
- Restore functionality works
- Backup rotation works as expected
- UI shows correct status information

### Phase 5

- Rate limiting prevents abuse
- Error handling provides useful information
- Performance is acceptable
- All functionality works in production