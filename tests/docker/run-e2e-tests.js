import { GenericContainer, Network } from 'testcontainers'
import { execSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '../..')

// Store container references globally so we can stop them later
let vueContainer
let minioContainer
let network

async function runDockerE2ETests() {
  network = await new Network().start()

  try {
    // Start MinIO container
    minioContainer = await new GenericContainer('minio/minio')
      .withNetwork(network)
      .withNetworkAliases('minio')
      .withExposedPorts(9000)
      .withEnvironment({
        MINIO_ROOT_USER: 'minioadmin',
        MINIO_ROOT_PASSWORD: 'minioadmin'
      })
      .withCommand(['server', '/data'])
      .start()

    execSync(
      'docker build ' +
      '--build-arg AWS_ENDPOINT_URL_S3=http://minio:9000 ' +
      '--build-arg AWS_REGION=us-east-1 ' +
      '--build-arg AWS_ACCESS_KEY_ID=minioadmin ' +
      '--build-arg AWS_SECRET_ACCESS_KEY=minioadmin ' +
      '--build-arg BUCKET_NAME=archery-backups-test ' +
      '-t vue-fast-test .',
      {
        cwd: projectRoot,
        stdio: 'inherit'
      }
    )

    // Start the Vue app container
    vueContainer = await new GenericContainer('vue-fast-test')
      .withNetwork(network)
      .withNetworkAliases('app')
      .withExposedPorts(8080)
      .withEnvironment({
        AWS_ENDPOINT_URL_S3: 'http://minio:9000',
        AWS_REGION: 'us-east-1',
        AWS_ACCESS_KEY_ID: 'minioadmin',
        AWS_SECRET_ACCESS_KEY: 'minioadmin',
        BUCKET_NAME: 'archery-backups-test',
        NODE_ENV: 'development',
        DEBUG: 'true'
      })
      .start()

    // Get the network name
    const networkName = network.getName()

    // Run Cypress using Docker directly with the browser set to electron
    // Enable video recording and ensure videos are saved to the host
    const cypressCommand = `docker run --rm --network ${networkName} -v "${projectRoot}:/e2e" -w /e2e -e CYPRESS_TSCONFIG=cypress/tsconfig.json cypress/included:12.17.4 run --headless --browser electron --config baseUrl=http://app:8080,video=true,videosFolder=/e2e/cypress/videos`

    try {
      execSync(cypressCommand, { stdio: 'inherit' })
      await stopContainers()

      return 0 // Success
    } catch (error) {
      console.error('Cypress tests failed:', error.message)

      // Stop all containers
      await stopContainers()

      return 1 // Failure
    }
  } catch (error) {
    console.error('Error running Docker E2E tests:', error)
    await stopContainers()
    return 1
  }
}

// Function to stop the containers
async function stopContainers() {
  if (vueContainer) {
    try {
      await vueContainer.stop()
    } catch (error) {
      console.error('Error stopping Vue app container:', error)
    }
  }

  if (minioContainer) {
    try {
      await minioContainer.stop()
    } catch (error) {
      console.error('Error stopping MinIO container:', error)
    }
  }

  if (network) {
    try {
      await network.stop()
    } catch (error) {
      console.error('Error stopping network:', error)
    }
  }
}

// Register cleanup handler
process.on('SIGINT', async () => {
  await stopContainers()
  process.exit(0)
})

// Run the tests and exit with the appropriate code
runDockerE2ETests().then(exitCode => {
  process.exit(exitCode)
})
