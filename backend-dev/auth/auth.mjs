import { betterAuth } from 'better-auth'
import { emailOTP, twoFactor } from 'better-auth/plugins'
import FormData from 'form-data'
import Mailgun from 'mailgun.js'
import { Pool } from 'pg'

const DATABASE_URL = process.env.DATABASE_URL
const AUTH_BASE_URL = process.env.BETTER_AUTH_URL?.trim()
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID?.trim()
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET?.trim()
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID?.trim()
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET?.trim()
const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY?.trim()
const MAILGUN_BASE_URL = process.env.MAILGUN_BASE_URL?.trim()
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN?.trim()
const MAILGUN_FROM = process.env.MAILGUN_FROM?.trim()
const REQUIRE_EMAIL_VERIFICATION =
  process.env.REQUIRE_EMAIL_VERIFICATION?.trim().toLowerCase() === 'true'
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
  }
} else {
  console.warn(
    'GitHub auth provider is disabled because credentials are missing',
  )
}

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  socialProviders.google = {
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
  }
} else {
  console.warn(
    'Google auth provider is disabled because credentials are missing',
  )
}

const buildOtpMessage = ({ otp, type }) => {
  const actionByType = {
    'sign-in': 'sign in',
    'email-verification': 'verify your email',
    'forget-password': 'reset your password',
    'two-factor': 'complete two-factor authentication',
  }
  const action = actionByType[type] ?? 'continue'

  return {
    subject: `Your one-time code for Promote Species (${action})`,
    text: `Your one-time code is: ${otp}\n\nUse this code to ${action}. The code expires in a few minutes.`,
  }
}

const mailgunClient = MAILGUN_API_KEY
  ? new Mailgun(FormData).client({
      username: 'api',
      key: MAILGUN_API_KEY,
      ...(MAILGUN_BASE_URL ? { url: MAILGUN_BASE_URL } : {}),
    })
  : null

const sendOtpEmail = async ({ email, otp, type }) => {
  const { subject, text } = buildOtpMessage({ otp, type })
  const resolvedDomain = MAILGUN_DOMAIN || 'mail.promote-species.app'
  const resolvedFrom =
    MAILGUN_FROM || `Promote Species <postmaster@${resolvedDomain}>`

  if (!mailgunClient) {
    console.warn(
      `[email-otp] MAILGUN_API_KEY is not configured. OTP for ${email} (${type}): ${otp}`,
    )
    return
  }

  try {
    await mailgunClient.messages.create(resolvedDomain, {
      from: resolvedFrom,
      to: [email],
      subject,
      text,
    })
  } catch (error) {
    throw new Error(`mailgun email otp send failed: ${String(error)}`)
  }
}

export const pool = new Pool({ connectionString: DATABASE_URL })

export const auth = betterAuth({
  ...(AUTH_BASE_URL ? { baseURL: AUTH_BASE_URL } : {}),
  appName: 'Promote Species',
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
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: REQUIRE_EMAIL_VERIFICATION,
    async sendResetPassword({ user, url, token }, request) {
      const resolvedDomain = MAILGUN_DOMAIN || 'mail.promote-species.app'
      const resolvedFrom =
        MAILGUN_FROM || `Promote Species <postmaster@${resolvedDomain}>`

      if (!mailgunClient) {
        console.warn(
          `[password-reset] MAILGUN_API_KEY is not configured. Reset link for ${user.email}: ${url}`,
        )
        return
      }

      try {
        await mailgunClient.messages.create(resolvedDomain, {
          from: resolvedFrom,
          to: [user.email],
          subject: 'Reset your password for Promote Species',
          text: `Click the link below to reset your password:\n\n${url}\n\nThis link expires in 1 hour.\n\nIf you did not request this, you can safely ignore this email.`,
        })
      } catch (error) {
        throw new Error(`mailgun password reset email send failed: ${String(error)}`)
      }
    },
  },
  plugins: [
    twoFactor({
      issuer: 'Promote Species',
      allowPasswordless: true,
      skipVerificationOnEnable: true,
      twoFactorTable: 'auth_two_factors',
      otpOptions: {
        async sendOTP({ user, otp }) {
          if (!user?.email) {
            throw new Error('two-factor otp send failed: missing user email')
          }
          await sendOtpEmail({
            email: user.email,
            otp,
            type: 'two-factor',
          })
        },
      },
      schema: {
        user: {
          fields: {
            twoFactorEnabled: 'two_factor_enabled',
          },
        },
        twoFactor: {
          fields: {
            id: 'id',
            userId: 'user_id',
            secret: 'secret',
            backupCodes: 'backup_codes',
            verified: 'verified',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
          },
        },
      },
    }),
    emailOTP({
      disableSignUp: true,
      overrideDefaultEmailVerification: true,
      sendVerificationOnSignUp: true,
      async sendVerificationOTP({ email, otp, type }) {
        await sendOtpEmail({ email, otp, type })
      },
    }),
  ],
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
    // The auth UI can start on one app origin while OAuth callbacks land on the
    // auth host. Persist state in the database and skip the extra cookie check.
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
