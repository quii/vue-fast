import { defineConfig } from "cypress";


export default defineConfig({
  e2e: {
    specPattern: "cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}",
    baseUrl: "http://localhost:4173",
    defaultCommandTimeout: 10000,
    retries: {
      runMode: 2,
      openMode: 0
    },
    // Reduce test output noise
    video: false,
    screenshotOnRunFailure: true, // Only capture screenshots on failure
    trashAssetsBeforeRuns: true
  },
  chromeWebSecurity: false, // https://github.com/cypress-io/cypress/issues/27501
  // Suppress browser launch messages
  browser: {
    // Disable browser logging in headless mode
    launchOptions: {
      args: [
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-extensions',
        '--disable-logging',
        '--disable-log-level',
        '--silent'
      ]
    }
  }
});
