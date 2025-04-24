import { GenericContainer } from 'testcontainers'
import { execSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import http from 'http'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '../..')

// Store container reference globally so we can stop it later
let container

async function runDockerTests() {
  console.log('Building Docker image...')

  try {
    // Build the Docker image
    execSync('docker build -t vue-fast-test .', {
      cwd: projectRoot,
      stdio: 'inherit'
    })

    console.log('Starting container...')

    // Start the container using testcontainers
    container = await new GenericContainer('vue-fast-test')
      .withExposedPorts(8080)
      .start()

    // Get the mapped port
    const port = container.getMappedPort(8080)
    const host = container.getHost()

    const url = `http://${host}:${port}`
    console.log(`Container started at ${url}`)

    // Set environment variables for Cypress
    process.env.CYPRESS_BASE_URL = url

    // Return the URL for start-server-and-test
    return url
  } catch (error) {
    console.error('Error running Docker tests:', error)
    process.exit(1)
  }
}

// Function to stop the container
export async function stopContainer() {
  if (container) {
    console.log('Stopping container...')
    await container.stop()
    console.log('Container stopped')
  }
}

// Register cleanup handler
process.on('SIGINT', async () => {
  await stopContainer()
  process.exit(0)
})

process.on('exit', async () => {
  await stopContainer()
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