# Cloud based backup

In @DataManagement we let users backup their data to a JSON file onto their device. The problem is, this is not
automatic and therefore it leaves the user vulnerable to losing their data.

I want us to create a cloud based backup system, where the app will periodically backup a copy of the user's data to the
cloud. I expect the data management page to have a list of cloud backups (with time and date they were written) that
they can tap to restore from.

## Backup cadence

Archers do not shoot often, so it's not necessary to back up every time they open the app. We only need to back up when
a user saves a shoot.

If it fails to back up, due to connectivity issues, we should retry a few times before giving up. We'll implement an
exponential backoff strategy for retries.

## Tech choices

- A node.js server hosted on Fly.io
- Written in TypeScript
- Tigris, which is an S3 compatible object store

## The server

### Storing endpoint
A simple endpoint which takes the contents of the JSON file, along with the user's name and device ID.

- The user's name will be retrieved from the existing field in `src/UserData.vue`
- The device ID will be generated and stored when the PWA is installed, ensuring it remains stable

It should _never_ override an existing backup, but instead create a new one, using the timestamp, user name and device
id to create a unique name. Or something equivalent that works with S3, im not sure.

We need to try and keep control of storage costs, so this should keep a maximum of 5 backups per name and device,
deleting the oldest one if there are more than 5. Additionally, we'll implement a safety measure to limit the total
number of backups to 100 across all users to prevent abuse.

### GET endpoints

Each endpoint should use content negotiation, supporting both HTML and JSON.

- / - List of names
- /name - List of devices for a given name
- /name/device - List of backups for a given name and device

### Error handling

Backup failures should be communicated to the user via an error message on the Data Management page. We'll also provide
a way for users to manually trigger a backup if the automatic one fails.

### Rate limiting

We'll implement a sensible rate limit on the API endpoints to protect the system from abuse.

## Client integration

We'll implement a decoupled event-based approach for triggering backups:

1. First, we'll modify the code in `src/stores/history.ts` to emit a custom JavaScript event when a score is saved:
   ```javascript
   // After successfully saving a score
   window.dispatchEvent(new CustomEvent('archery-data-changed', { detail: { type: 'score-saved' } }));
   ```

2. Then, we'll create a separate backup service that listens for these events:
   ```javascript
   window.addEventListener('archery-data-changed', (event) => {
     // Trigger backup process
     backupService.scheduleBackup();
   });
   ```

3. This decoupled approach will allow us to:
    - Add more event types that trigger backups in the future
    - Keep the backup logic separate from the core app logic
    - Test the backup functionality independently

The backup feature will only be available when the PWA is installed, and we'll check for this condition using the
existing code in `src/stores/installation.ts`.

### Offline handling

We'll use service workers to handle offline scenarios:

- When a backup is attempted while offline, we'll queue it for when connectivity is restored
- The service worker will monitor network status and attempt to process the backup queue when online

## UI changes

The Data Management page (`src/DataManagement.vue`) will be updated to include:

1. A list of the most recent cloud backups with timestamps
2. The ability to tap a backup to restore it (with a confirmation dialog)
3. A manual backup button to force a cloud backup
4. Status indicators for backup success/failure
5. Before restoring from a cloud backup, the system will automatically create a backup of the current state

The cloud backup UI elements will only be shown to users who have the PWA installed.

## Testing

We'll implement the following testing strategy:

1. Black box tests for the server and its endpoints
2. E2E tests using Cypress to demonstrate the full backup and restore flow:
    - User completes a shoot
    - Data is automatically backed up
    - User completes another shoot
    - User restores from the first backup
    - Verify the data is correctly restored to the previous state

## Local experience

We should be able to spin up this server locally and test it out with the PWA app running alongside. We'll use a
suitable fake S3 storage for testing and local development.

## Deployment

We'll use a combined service approach for deployment:

1. Update the Dockerfile to use Node.js instead of the current static file server:
   ```dockerfile
   # Build stage for Vue app
   FROM node:18-alpine as build-stage
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build

   # Production stage
   FROM node:18-alpine as production-stage
   WORKDIR /app
   COPY --from=build-stage /app/dist ./dist
   COPY server ./server
   COPY package*.json ./
   RUN npm install --production

   # Start the server
   CMD ["node", "server/index.js"]
   ```

2. Create an Express server that:
    - Serves the static Vue app files
    - Handles API requests at `/api/*`
    - Forwards all other requests to the Vue app for client-side routing

3. Update the service worker configuration to exclude API routes from being cached:
   ```javascript
   // In PWA configuration
   navigateFallbackDenylist: [/^\/api\//]
   ```

This approach allows us to:

- Keep serving the PWA as before
- Add the new API functionality for cloud backups
- Deploy everything as a single service on Fly.io
- Prevent the PWA from trying to handle API requests
