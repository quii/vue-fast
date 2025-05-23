import { execSync } from 'child_process';
import fetch from 'node-fetch';

// Check if Docker is running
function isDockerRunning() {
  try {
    execSync('docker info', { stdio: 'ignore' });
    return true;
  } catch(error) {
    console.error(error);
    return false;
  }
}

// Check if Redis container is running
async function isRedisRunning() {
  try {
    const response = await fetch('http://localhost:2375/containers/json', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return false;
    }

    const containers = await response.json();
    return containers.some(container =>
      container.Image.includes('redis') &&
      container.State === 'running'
    );
  } catch (error) {
    console.error(error);
    return false;
  }
}

// Start Redis container
async function startRedisContainer() {
  console.log('Starting Redis container...');

  try {
    // Check if redis container already exists
    const existingContainer = execSync('docker ps -a --filter "name=fast-redis" --format "{{.Names}}"').toString().trim();

    if (existingContainer === 'fast-redis') {
      // Container exists, start it if it's not running
      const isRunning = execSync('docker ps --filter "name=fast-redis" --format "{{.Names}}"').toString().trim() === 'fast-redis';

      if (!isRunning) {
        execSync('docker start fast-redis');
        console.log('Started existing Redis container');
      } else {
        console.log('Redis container is already running');
      }
    } else {
      // Create and start a new container
      execSync(`
        docker run -d \
          --name fast-redis \
          -p 6379:6379 \
          redis:6
      `);
      console.log('Created and started new Redis container');
    }

    return true;
  } catch (error) {
    console.error('Failed to start Redis container:', error);
    return false;
  }
}

// Main function
async function main() {
  if (!isDockerRunning()) {
    console.error('Docker is not running. Please start Docker and try again.');
    process.exit(1);
  }

  const redisRunning = await isRedisRunning();

  if (!redisRunning) {
    const started = await startRedisContainer();
    if (!started) {
      console.error('Failed to start Redis container');
      process.exit(1);
    }
  }

  console.log('Redis is running and available at localhost:6379');
}

main().catch(error => {
  console.error('Error ensuring Redis is running:', error);
  process.exit(1);
});