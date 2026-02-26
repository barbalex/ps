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
})
