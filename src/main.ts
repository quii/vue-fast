import './assets/main.css'

import { createAppInstance, setupServiceWorker, setupBackupEventListener } from './createApp'

// Set up service worker for production
setupServiceWorker()

// Set up backup event listener
setupBackupEventListener()

// Create and mount the app
const { app } = createAppInstance()
app.mount('#app')
