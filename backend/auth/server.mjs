// https://www.better-auth.com/docs/integrations/fastify
import express from 'express'
import cors from 'cors'
import { toNodeHandler, fromNodeHeaders } from 'better-auth/node'
import { auth } from './auth.mjs' // Your configured Better Auth instance

const app = express()
const port = 3002

// Configure CORS middleware
app.use(
  cors({
    origin: 'http://localhost:5176', // Replace with your frontend's origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  }),
)

app.all('/api/auth/*splat', toNodeHandler(auth))
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
