import { betterAuth } from 'better-auth'
import { Pool } from 'pg'

const DATABASE_URL = process.env.DATABASE_URL
const AUTH_BASE_URL =
  process.env.BETTER_AUTH_URL?.trim() || 'https://auth.promote-species.app'
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID?.trim()
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET?.trim()
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID?.trim()
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET?.trim()
const requiredTrustedOrigins = [
  'http://localhost:5176',
  'https://arten-fördern.app',
  'https://xn--arten-frdern-bjb.app',
  'https://arten-fördern.ch',
  'https://xn--arten-frdern-bjb.ch',
  'https://promote-species.app',
]
const configuredTrustedOrigins = [
  process.env.CLIENT_ORIGIN,
  ...(process.env.CORS_ORIGINS ?? '').split(','),
]
  .map((value) => value?.trim())
  .filter(Boolean)
const trustedOrigins = [
  ...new Set([...configuredTrustedOrigins, ...requiredTrustedOrigins]),
]

const socialProviders = {}

if (GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET) {
  socialProviders.github = {
    clientId: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    redirectURI: `${AUTH_BASE_URL}/auth/callback/github`,
  }
} else {
  console.warn('GitHub auth provider is disabled because credentials are missing')
}

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  socialProviders.google = {
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    redirectURI: `${AUTH_BASE_URL}/auth/callback/google`,
  }
} else {
  console.warn('Google auth provider is disabled because credentials are missing')
}

export const pool = new Pool({ connectionString: DATABASE_URL })

export const auth = betterAuth({
  baseURL: AUTH_BASE_URL,
  basePath: '/auth',
  database: pool,
  advanced: {
    database: {
      // Keep DB-generated IDs for users (uuid_generate_v7).
      generateId: false,
      // experimental: { joins: true },
    },
  },
  // joins causing error thus uncommented.
  // TODO: test later and consider re-enabling if it can be made to work
  // experimental: { joins: true },
  trustedOrigins,
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  socialProviders,
  user: {
    modelName: 'users',
    fields: {
      // do I need to set how the id is generated?
      id: 'user_id',
      name: 'name',
      email: 'email',
      emailVerified: 'email_verified',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    additionalFields: {
      label: {
        type: 'string',
        required: false,
        input: false,
      },
    },
  },
  session: {
    modelName: 'auth_sessions',
    fields: {
      id: 'auth_session_id',
      userId: 'user_id',
      token: 'token',
      expiresAt: 'expires_at',
      ipAddress: 'ip_address',
      userAgent: 'user_agent',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  account: {
    // The auth UI can start on arten-fördern.app while OAuth callbacks land on
    // auth.promote-species.app. Persist state in the database and do not require
    // the extra state cookie round-trip, which is brittle in that cross-origin flow.
    storeStateStrategy: 'database',
    skipStateCookieCheck: true,
    modelName: 'auth_accounts',
    fields: {
      id: 'auth_account_id',
      userId: 'user_id',
      accountId: 'sso_account_id',
      providerId: 'provider_id',
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
      accessTokenExpiresAt: 'access_token_expires_at',
      refreshTokenExpiresAt: 'refresh_token_expires_at',
      scope: 'scope',
      idToken: 'id_token',
      password: 'password',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  verification: {
    modelName: 'auth_verifications',
    fields: {
      id: 'auth_verification_id',
      identifier: 'identifier',
      value: 'value',
      expiresAt: 'expires_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
})
