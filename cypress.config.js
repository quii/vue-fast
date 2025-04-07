import { defineConfig } from "cypress";


export default defineConfig({
  e2e: {
    specPattern: "cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}",
    baseUrl: "http://localhost:4173",
    defaultCommandTimeout: 10000,
    retries: {
      runMode: 2,
      openMode: 0
    }
  },
  chromeWebSecurity: false // https://github.com/cypress-io/cypress/issues/27501
});
