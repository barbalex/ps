import { betterAuth } from 'better-auth'
import { Pool } from 'pg'

const DATABASE_URL = process.env.DATABASE_URL
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET

export const auth = betterAuth({
  database: new Pool({ connectionString: DATABASE_URL }),
  advanced: {
    database: {
      // https://www.better-auth.com/docs/concepts/database#id-generation
      // allows your database handle all ID generation
      generateId: false,
    },
  },
  // causing error thus uncommented
  // experimental: { joins: true },
  trustedOrigins: ['http://localhost:5176', 'https://promote-species.app'],
  emailAndPassword: { enabled: true },
  socialProviders: {
    github: {
      clientId: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
    },
  },
  user: {
    modelName: 'users',
    fields: {
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
      updated_by: {
        type: 'string',
        required: false,
        input: false,
      },
    },
  },
  session: {
    modelName: 'sessions',
    fields: {
      id: 'session_id',
      userId: 'user_id',
      token: 'token',
      expiresAt: 'expires_at',
      ipAddress: 'ip_address',
      userAgent: 'user_agent',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    additionalFields: {
      updated_by: {
        type: 'string',
        required: false,
        input: false,
      },
    },
  },
  account: {
    modelName: 'accounts',
    fields: {
      id: 'account_id',
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
    additionalFields: {
      type: {
        type: 'string',
        required: false,
        input: false,
      },
      period_start: {
        type: 'date',
        required: false,
        input: false,
      },
      period_end: {
        type: 'date',
        required: false,
        input: false,
      },
      projects_label_by: {
        type: 'string',
        required: false,
        input: false,
      },
      label: {
        type: 'string',
        required: false,
        input: false,
      },
      updated_by: {
        type: 'string',
        required: false,
        input: false,
      },
    },
  },
  verification: {
    modelName: 'verifications',
    fields: {
      id: 'verification_id',
      identifier: 'identifier',
      value: 'value',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
})
