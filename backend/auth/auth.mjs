import { betterAuth } from 'better-auth'
import { Pool } from 'pg'

const DATABASE_URL = process.env.DATABASE_URL
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET
const pool = new Pool({ connectionString: DATABASE_URL })

const getEmailFromContext = (context) => {
  const email = context?.body?.email
  return typeof email === 'string' ? email.trim().toLowerCase() : null
}

const findUserIdByEmail = async (email) => {
  if (!email) return null
  const { rows } = await pool.query(
    'select user_id::text as user_id from users where lower(email) = $1 order by created_at desc limit 1',
    [email],
  )
  return rows?.[0]?.user_id ?? null
}

export const auth = betterAuth({
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
  trustedOrigins: [
    'http://localhost:5176',
    'https://arten-fördern.app',
    'https://promote-species.app',
  ],
  emailAndPassword: { enabled: true },
  databaseHooks: {
    account: {
      create: {
        async before(account, context) {
          if (account?.userId && account?.accountId) return
          const email = getEmailFromContext(context)
          const userId = await findUserIdByEmail(email)
          if (!userId) return
          return {
            data: {
              ...account,
              userId,
              accountId: account?.accountId ?? userId,
            },
          }
        },
      },
    },
    session: {
      create: {
        async before(session, context) {
          if (session?.userId) return
          const email = getEmailFromContext(context)
          const userId = await findUserIdByEmail(email)
          if (!userId) return
          return {
            data: {
              ...session,
              userId,
            },
          }
        },
      },
    },
  },
  socialProviders: {
    github: {
      clientId: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
    },
  },
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
