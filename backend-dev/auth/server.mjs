// https://www.better-auth.com/docs/integrations/fastify
import express from 'express'
import cors from 'cors'
import { toNodeHandler, fromNodeHeaders } from 'better-auth/node'
import { auth } from './auth.mjs' // Your configured Better Auth instance

const app = express()
const port = Number(process.env.PORT ?? 3003)
const corsOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5176')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean)

// Configure CORS middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (no origin header), e.g. health checks.
      if (!origin) return callback(null, true)
      if (corsOrigins.includes(origin)) return callback(null, true)
      return callback(new Error('Not allowed by CORS'))
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  }),
)

app.all('/api/auth/*splat', toNodeHandler(auth))

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true })
})

// Mount express json middleware after Better Auth handler
// or only apply it to routes that don't interact with Better Auth
app.use(express.json())
app.listen(port, () => {
  console.log(`Auth app listening on port ${port}`)
})

app.get('/api/me', async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  })
  return res.json(session)
})
