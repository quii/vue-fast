import { GenericContainer, Network } from 'testcontainers'
import { execSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import http from 'http'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '../..')

// Store container references globally so we can stop them later
let vueContainer
let minioContainer
let network

async function runDockerTests() {
  console.log('Creating Docker network...')
  network = await new Network().start()

  console.log('Starting MinIO container...')
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

    const minioPort = minioContainer.getMappedPort(9000)
    const minioHost = minioContainer.getHost()
    console.log(`MinIO started at http://${minioHost}:${minioPort}`)

    console.log('Building Docker image...')

    // Build the Docker image with build args for S3 configuration
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

    console.log('Starting Vue app container...')

    // Start the Vue app container with debugging
    vueContainer = await new GenericContainer('vue-fast-test')
      .withNetwork(network)
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

    // Get the mapped port
    const port = vueContainer.getMappedPort(8080)
    const host = vueContainer.getHost()

    const url = `http://${host}:${port}`
    console.log(`Vue app container started at ${url}`)

    // Add some additional logging to help debug
    console.log(`Host: ${host}`)
    console.log(`Port: ${port}`)
    console.log(`Full URL: ${url}`)

    // Try to make a test request to verify connectivity
    try {
      const testReq = http.request({
        hostname: host,
        port: port,
        path: '/',
        method: 'GET',
        timeout: 5000
      }, (res) => {
        console.log(`Test request status: ${res.statusCode}`)
      })

      testReq.on('error', (e) => {
        console.error(`Test request error: ${e.message}`)
      })

      testReq.end()
    } catch (error) {
      console.error(`Error making test request: ${error.message}`)
    }

    // Set environment variables for Cypress
    process.env.CYPRESS_BASE_URL = url

    // Return the URL for start-server-and-test
    return url
  } catch (error) {
    console.error('Error running Docker tests:', error)
    await stopContainers()
    process.exit(1)
  }
}

// Function to stop the containers
export async function stopContainers() {
  console.log('Stopping containers...')

  if (vueContainer) {
    console.log('Stopping Vue app container...')
    await vueContainer.stop()
    console.log('Vue app container stopped')
  }

  if (minioContainer) {
    console.log('Stopping MinIO container...')
    await minioContainer.stop()
    console.log('MinIO container stopped')
  }

  if (network) {
    console.log('Stopping network...')
    await network.stop()
    console.log('Network stopped')
  }
}

// Register cleanup handler
process.on('SIGINT', async () => {
  await stopContainers()
  process.exit(0)
})

process.on('exit', async () => {
  await stopContainers()
})

// If this script is run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runDockerTests().then(url => {
    // Create a simple HTTP server to keep the process running
    // but allow start-server-and-test to continue
    const server = http.createServer((req, res) => {
      res.writeHead(200)
      res.end('Docker container running')
    })

    server.listen(0, () => {
      const port = server.address().port
      console.log(`Helper server running on port ${port}`)
      console.log(`Container URL: ${url}`)
      console.log('Press Ctrl+C to stop')
    })
  })
}

export default runDockerTests