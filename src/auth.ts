import { betterAuth } from 'better-auth'
import { Pool } from 'pg'

const DATABASE_URL = import.meta.env.DATABASE_URL

export const auth = betterAuth({
  database: new Pool({ connectionString: DATABASE_URL }),
})
