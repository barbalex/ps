import { betterAuth } from 'better-auth'
import { Pool } from 'pg'

const DATABASE_URL = import.meta.env.DATABASE_URL

export const auth = betterAuth({
  database: new Pool({ connectionString: DATABASE_URL }),
  user: {
    modelName: 'users',
    id: 'user_id',
    emailVerified: 'email_verified',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  session: {
    modelName: 'sessions',
    id: 'session_id',
    userId: 'user_id',
    expiresAt: 'expires_at',
    ipAddress: 'ip_address',
    userAgent: 'user_agent',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  account: {
    modelName: 'accounts',
    id: 'account_id',
    userId: 'user_id',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
