// https://www.better-auth.com/docs/integrations/fastify
import express from 'express'
import cors from 'cors'
import { toNodeHandler, fromNodeHeaders } from 'better-auth/node'
import { auth, pool } from './auth.mjs' // Your configured Better Auth instance

const app = express()
const port = Number(process.env.PORT ?? 3003)
const requiredCorsOrigins = [
  'http://localhost:5176',
  'https://arten-fördern.app',
  'https://xn--arten-frdern-bjb.app',
  'https://arten-fördern.ch',
  'https://xn--arten-frdern-bjb.ch',
  'https://promote-species.app',
]
const configuredCorsOrigins = (process.env.CORS_ORIGINS ?? '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean)
const corsOrigins = [...new Set([...configuredCorsOrigins, ...requiredCorsOrigins])]

// Configure CORS middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (no origin header), e.g. health checks.
      if (!origin) return callback(null, true)
      if (corsOrigins.includes(origin)) return callback(null, true)
      return callback(null, false)
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  }),
)

app.all('/auth/*splat', toNodeHandler(auth))

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true })
})

// Mount express json middleware after Better Auth handler
// or only apply it to routes that don't interact with Better Auth
app.use(express.json())

const PREVIEW_TEST_EMAIL = process.env.PREVIEW_TEST_EMAIL ?? 'test@test.ch'
const PREVIEW_TEST_PASSWORD = process.env.PREVIEW_TEST_PASSWORD ?? 'test-test'
const PREVIEW_TEST_NAME = process.env.PREVIEW_TEST_NAME ?? 'Preview Test User'
const PREVIEW_TRUSTED_ORIGIN =
  process.env.PREVIEW_TRUSTED_ORIGIN ?? corsOrigins[0] ?? 'http://localhost:5176'

const postAuthJson = async (path, payload) => {
  const response = await fetch(`http://127.0.0.1:${port}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: PREVIEW_TRUSTED_ORIGIN,
    },
    body: JSON.stringify(payload),
  })
  const bodyText = await response.text()
  return { ok: response.ok, status: response.status, bodyText }
}

const signInPreviewUser = async () => {
  const result = await postAuthJson('/auth/sign-in/email', {
    email: PREVIEW_TEST_EMAIL,
    password: PREVIEW_TEST_PASSWORD,
    rememberMe: false,
  })
  return result
}

const signUpPreviewUser = async () => {
  const result = await postAuthJson('/auth/sign-up/email', {
    email: PREVIEW_TEST_EMAIL,
    password: PREVIEW_TEST_PASSWORD,
    name: PREVIEW_TEST_NAME,
  })
  return result
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const resetPreviewUser = async () => {
  const userResult = await pool.query(
    'SELECT user_id FROM users WHERE email = $1 LIMIT 1',
    [PREVIEW_TEST_EMAIL],
  )
  const userId = userResult.rows?.[0]?.user_id
  if (!userId) return

  await pool.query('DELETE FROM auth_sessions WHERE user_id = $1', [userId])
  await pool.query('DELETE FROM auth_accounts WHERE user_id = $1', [userId])
  await pool.query('DELETE FROM users WHERE user_id = $1', [userId])
}

const hasCredentialAccount = async () => {
  const userResult = await pool.query(
    'SELECT user_id FROM users WHERE email = $1 LIMIT 1',
    [PREVIEW_TEST_EMAIL],
  )
  const userId = userResult.rows?.[0]?.user_id
  if (!userId) return false

  const accountResult = await pool.query(
    `SELECT 1
     FROM auth_accounts
     WHERE user_id = $1
       AND provider_id = 'credential'
       AND password IS NOT NULL
     LIMIT 1`,
    [userId],
  )

  return (accountResult.rowCount ?? 0) > 0
}

const ensurePreviewUser = async () => {
  const maxAttempts = 5
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const hasCredential = await hasCredentialAccount()
      if (!hasCredential) {
        await resetPreviewUser()
      }

      const signInResult = await signInPreviewUser()
      if (signInResult.ok) {
        console.log('Preview test user is ready')
        return true
      }

      const signUpResult = await signUpPreviewUser()
      if (signUpResult.ok) {
        const signInAfterCreate = await signInPreviewUser()
        if (signInAfterCreate.ok) {
          console.log('Preview test user created')
          return true
        }
      }

      console.warn(
        `Preview test user ensure attempt ${attempt} failed (sign-in: ${signInResult.status}, sign-up: ${signUpResult.status}, sign-in-body: ${signInResult.bodyText}, sign-up-body: ${signUpResult.bodyText})`,
      )
    } catch (error) {
      console.warn(`Preview test user ensure attempt ${attempt} errored:`, error)
    }

    if (attempt < maxAttempts) {
      await delay(1000 * attempt)
    }
  }

  console.warn('Could not ensure preview test user after retries')
  return false
}

const startPreviewUserProvisioning = () => {
  const retryDelayMs = 30_000

  const run = async () => {
    const ensured = await ensurePreviewUser()
    if (!ensured) {
      console.warn(
        `Retrying preview test user provisioning in ${retryDelayMs / 1000}s`,
      )
      setTimeout(run, retryDelayMs)
    }
  }

  run()
}

app.listen(port, () => {
  console.log(`Auth app listening on port ${port}`)
  startPreviewUserProvisioning()
})

app.get('/api/me', async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  })
  return res.json(session)
})
