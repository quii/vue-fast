// cleanup-script.js
import fetch from 'node-fetch'

async function cleanupTestData() {
  // Check if the --live flag is present in the command line arguments
  const isLive = process.argv.includes('--live')

  // Set the appropriate URL based on the environment
  const baseUrl = isLive
    ? 'https://winter-feather-5776.fly.dev'
    : 'http://localhost:5173'

  const endpoint = '/api/delete-test-backups'
  const url = `${baseUrl}${endpoint}`

  console.log(`Cleaning up test data from: ${url}`)

  try {
    const response = await fetch(url, {
      method: 'DELETE'
    })

    const result = await response.json()
    console.log(result.message)

    if (!result.success) {
      process.exit(1) // Exit with error code
    }
  } catch (error) {
    console.error('Failed to clean up test data:', error)
    process.exit(1)
  }
}

cleanupTestData()
