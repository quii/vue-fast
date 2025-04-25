#!/usr/bin/env node

import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

async function ensureMinioRunning() {
  try {
    console.log('Checking if MinIO is already running...')

    // Check if the container is already running
    const { stdout } = await execAsync('docker ps --filter "name=archery-minio" --format "{{.Names}}"')

    if (stdout.trim() === 'archery-minio') {
      console.log('MinIO is already running.')
    } else {
      // Check if the container exists but is stopped
      const { stdout: stoppedContainers } = await execAsync('docker ps -a --filter "name=archery-minio" --format "{{.Names}}"')

      if (stoppedContainers.trim() === 'archery-minio') {
        console.log('Starting existing MinIO container...')
        await execAsync('docker start archery-minio')
        console.log('MinIO started successfully.')
      } else {
        // Container doesn't exist, create and start it
        console.log('Starting new MinIO container...')
        await execAsync(
          'docker run -d -p 9000:9000 -p 9001:9001 --name archery-minio ' +
          '-e MINIO_ROOT_USER=minioadmin -e MINIO_ROOT_PASSWORD=minioadmin ' +
          'minio/minio server /data --console-address :9001'
        )
        console.log('MinIO started successfully.')
      }
    }

    // Print connection details
    console.log('\nMinIO Connection Details:')
    console.log('API Endpoint: http://localhost:9000')
    console.log('Web Console: http://localhost:9001')
    console.log('Access Key: minioadmin')
    console.log('Secret Key: minioadmin')
    console.log('\nYou can access the MinIO console at http://localhost:9001 with the credentials above.\n')

  } catch (error) {
    console.error('Error ensuring MinIO is running:', error.message)
    console.log('')
    console.log('You might need to install Docker or start it manually:')
    console.log('docker run -d -p 9000:9000 -p 9001:9001 --name archery-minio -e MINIO_ROOT_USER=minioadmin -e MINIO_ROOT_PASSWORD=minioadmin minio/minio server /data --console-address :9001')
    console.log('')
    console.log('Continuing without MinIO...')
  }
}

ensureMinioRunning()