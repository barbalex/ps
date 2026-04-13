// https://www.better-auth.com/docs/integrations/fastify
import express from 'express'
import cors from 'cors'
import { toNodeHandler, fromNodeHeaders } from 'better-auth/node'
import { hashPassword } from '@better-auth/utils/password'
import { auth, pool } from './auth.mjs' // Your configured Better Auth instance

const app = express()
const port = Number(process.env.PORT ?? 3003)
const appUrls = ['https://promote-species.app', 'https://xn--arten-frdern-bjb.app']
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

const escapeHtml = (value = '') =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const renderAuthErrorPage = ({ error }) => {
  const safeError = escapeHtml(error || 'unknown_error')
  const links = appUrls
    .map(
      (url) =>
        `<li><a href="${url}" style="color:#0b5fff">${escapeHtml(url)}</a></li>`,
    )
    .join('')

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Authentication Error</title>
  </head>
  <body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#f6f8fb;color:#1f2937;margin:0;padding:24px;">
    <main style="max-width:640px;margin:0 auto;background:white;border:1px solid #dbe1ea;border-radius:12px;padding:20px;">
      <h1 style="margin:0 0 12px 0;font-size:24px;">Sign-in could not be completed</h1>
      <p style="margin:0 0 8px 0;">Auth error code: <strong>${safeError}</strong></p>
      <p style="margin:0 0 16px 0;">Please retry sign-in from one of these app URLs:</p>
      <ul style="margin:0 0 16px 18px;padding:0;">${links}</ul>
      <p style="margin:0;font-size:14px;color:#4b5563;">If this keeps happening, clear site cookies for the auth/app domains and try again.</p>
    </main>
  </body>
</html>`
}

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

// Custom endpoint for OAuth-only users to set a password
app.post('/auth/set-password', express.json(), async (req, res) => {
  try {
    const { newPassword } = req.body

    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    })
    const userId = session?.user?.id

    if (!userId) {
      return res.status(401).json({ error: { code: 'SESSION_INVALID' } })
    }

    // Check if user has credential account already.
    const accountsResult = await pool.query(
      'SELECT auth_account_id, password FROM auth_accounts WHERE user_id = $1 AND provider_id = $2 ORDER BY created_at DESC LIMIT 1',
      [userId, 'credential'],
    )

    // Check password requirements
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ 
        error: { code: 'INVALID_PASSWORD' } 
      })
    }

    const hashedPassword = await hashPassword(newPassword)

    if (accountsResult.rows.length > 0) {
      const existing = accountsResult.rows[0]
      const existingHash = String(existing.password ?? '')
      const looksLikeBetterAuthHash =
        /^[a-f0-9]{32}:[a-f0-9]{128}$/i.test(existingHash)

      if (looksLikeBetterAuthHash) {
        return res.status(400).json({
          error: { code: 'PASSWORD_ALREADY_EXISTS' },
        })
      }

      // Repair malformed legacy hash created by older custom endpoint implementation.
      await pool.query(
        `UPDATE auth_accounts
         SET password = $2, updated_at = NOW()
         WHERE auth_account_id = $1`,
        [existing.auth_account_id, hashedPassword],
      )

      return res.json({ ok: true, repaired: true })
    }

    await pool.query(
      `INSERT INTO auth_accounts
       (user_id, provider_id, sso_account_id, password, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())`,
      [userId, 'credential', userId, hashedPassword],
    )

    // Keep 2FA state consistent for users who have never completed 2FA setup.
    await pool.query(
      `UPDATE users u
       SET two_factor_enabled = FALSE,
           updated_at = NOW()
       WHERE u.user_id = $1
         AND NOT EXISTS (
           SELECT 1
           FROM auth_two_factors t
           WHERE t.user_id = u.user_id
             AND COALESCE(t.verified, TRUE) = TRUE
         )`,
      [userId],
    )

    res.json({ ok: true })
  } catch (error) {
    console.error('Set password error:', error)
    res.status(500).json({ error: { code: 'INTERNAL_ERROR' } })
  }
})

app.get('/auth/two-factor/status', async (req, res) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    })
    const userId = session?.user?.id

    if (!userId) {
      return res.status(401).json({ error: { code: 'SESSION_INVALID' } })
    }

    const statusResult = await pool.query(
      `SELECT
         COALESCE(u.two_factor_enabled, FALSE) AS enabled,
         EXISTS(
           SELECT 1
           FROM auth_two_factors t
           WHERE t.user_id = u.user_id
             AND COALESCE(t.verified, TRUE) = TRUE
         ) AS has_configured
       FROM users u
       WHERE u.user_id = $1
       LIMIT 1`,
      [userId],
    )

    const status = statusResult.rows[0]
    if (!status) {
      return res.status(404).json({ error: { code: 'USER_NOT_FOUND' } })
    }

    const enabled = status.enabled === true
    const hasConfigured = status.has_configured === true
    const effectiveEnabled = enabled && hasConfigured

    if (enabled && !hasConfigured) {
      await pool.query(
        'UPDATE users SET two_factor_enabled = FALSE, updated_at = NOW() WHERE user_id = $1',
        [userId],
      )
    }

    return res.json({ enabled: effectiveEnabled, hasConfigured })
  } catch (error) {
    console.error('Two-factor status error:', error)
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR' } })
  }
})

app.all('/auth/*splat', toNodeHandler(auth))

app.get('/', (req, res, next) => {
  const error = req.query?.error
  if (!error) return next()
  res
    .status(400)
    .type('html')
    .send(renderAuthErrorPage({ error }))
})

app.get('/auth/error', (req, res) => {
  res
    .status(400)
    .type('html')
    .send(renderAuthErrorPage({ error: req.query?.error }))
})

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
