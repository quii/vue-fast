import { createServer as createViteServer } from 'vite'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Path to the public directory
const publicDir = resolve(__dirname, '../../../../public')

export function createServer() {
  let server: ReturnType<typeof createViteServer> | null = null
  // Store the original fetch function
  const originalFetch = global.fetch

  return {
    async start() {
      server = await createViteServer({
        server: {
          port: 3000,
          host: 'localhost'
        },
        publicDir,
        base: '/'
      })

      await server.listen()
      console.log('Mock server started on http://localhost:3000')

      // Intercept fetch requests to redirect them to the mock server
      const originalFetch = global.fetch
      global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = input instanceof URL ? input : new URL(input.toString(), 'http://localhost:3000')

        // If the URL starts with /data, redirect it to the mock server
        if (url.pathname.startsWith('/data')) {
          const mockUrl = new URL(url.pathname, 'http://localhost:3000')
          console.log(`Redirecting fetch to mock server: ${mockUrl.toString()}`)
          return originalFetch(mockUrl.toString(), init)
        }

        // Otherwise, use the original fetch
        return originalFetch(input, init)
      }
    },

    async stop() {
      if (server) {
        await server.close()
        server = null
        console.log('Mock server stopped')

        // Restore the original fetch
        global.fetch = originalFetch
      }
    }
  }


}