import Fastify from 'fastify'
import { auth } from './auth.mjs' // Your configured Better Auth instance

const fastify = Fastify({ logger: true })

// Register authentication endpoint
fastify.route({
  method: ['GET', 'POST'],
  url: '/api/auth/*',
  async handler(request, reply) {
    try {
      // Construct request URL
      const url = new URL(request.url, `http://${request.headers.host}`)

      // Convert Fastify headers to standard Headers object
      const headers = new Headers()
      Object.entries(request.headers).forEach(([key, value]) => {
        if (value) headers.append(key, value.toString())
      })

      // Create Fetch API-compatible request
      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        ...(request.body ? { body: JSON.stringify(request.body) } : {}),
      })

      // Process authentication request
      const response = await auth.handler(req)

      // Forward response to client
      reply.status(response.status)
      response.headers.forEach((value, key) => reply.header(key, value))
      reply.send(response.body ? await response.text() : null)
    } catch (error) {
      fastify.log.error('Authentication Error:', error)
      reply.status(500).send({
        error: 'Internal authentication error',
        code: 'AUTH_FAILURE',
      })
    }
  },
})

// Initialize server
fastify.listen({ port: 4000 }, (err) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  console.log('Server running on port 4000')
})
