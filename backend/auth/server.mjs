// https://www.better-auth.com/docs/integrations/fastify
import Fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import { auth } from './auth.mjs' // Your configured Better Auth instance

const fastify = Fastify({ logger: true })

// Configure CORS policies
fastify.register(fastifyCors, {
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5176',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400,
})

// Register authentication endpoint
fastify.route({
  method: ['GET', 'POST'],
  // why is this not /* ?
  // url: '/api/auth/*',
  url: '*',
  async handler(request, reply) {
    console.log('Received auth request:', request)
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
      console.log('Auth response:', response)

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
fastify.listen({ port: 3002 }, (err) => {
  if (err) {
    console.log('Failed to start auth server:', err)
    fastify.log.error(err)
    process.exit(1)
  }
  console.log('Auth server running on port 3002')
})
