import runDockerTests from './run-docker-tests.js'
import { stopContainers } from './run-docker-tests.js'
import { spawn } from 'child_process'

async function runTests() {
  try {
    // Start the Docker container
    const url = await runDockerTests()

    console.log(`Running Cypress tests against ${url}`)

    // Run Cypress tests
    const cypress = spawn('npx', ['cypress', 'run', `--config`, `baseUrl=${url}`], {
      stdio: 'inherit',
      shell: true
    })

    // Wait for Cypress to finish
    cypress.on('close', async (code) => {
      console.log(`Cypress process exited with code ${code}`)

      // Stop the container
      await stopContainers()

      // Exit with the same code as Cypress
      process.exit(code)
    })
  } catch (error) {
    console.error('Error running tests:', error)
    await stopContainers()
    process.exit(1)
  }
}

runTests()