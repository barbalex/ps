import { betterAuth } from 'better-auth'
import { emailOTP, twoFactor } from 'better-auth/plugins'
import { passkey } from '@better-auth/passkey'
import FormData from 'form-data'
import Mailgun from 'mailgun.js'
import { Pool } from 'pg'

const DATABASE_URL = process.env.DATABASE_URL
const AUTH_BASE_URL = process.env.BETTER_AUTH_URL?.trim()
const DEFAULT_CLIENT_ORIGIN = 'http://localhost:5176'
const PASSKEY_ORIGIN =
  (process.env.CLIENT_ORIGIN?.trim() || DEFAULT_CLIENT_ORIGIN).replace(/\/$/, '')
const PASSKEY_RP_ID =
  process.env.PASSKEY_RP_ID?.trim() ||
  (() => {
    try {
      const host = new URL(PASSKEY_ORIGIN).hostname
      return host === 'localhost' ? 'localhost' : host
    } catch {
      return 'localhost'
    }
  })()
const PASSKEY_RP_NAME = process.env.PASSKEY_RP_NAME?.trim() || 'Promote Species'
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

const SUPPORTED_EMAIL_LANGUAGES = ['de', 'en', 'fr', 'it']

const getHeader = (source, name) => {
  if (!source) return undefined

  if (typeof source.headers?.get === 'function') {
    return source.headers.get(name) ?? undefined
  }

  if (typeof source.request?.headers?.get === 'function') {
    return source.request.headers.get(name) ?? undefined
  }

  const headers = source.headers ?? source.request?.headers
  if (!headers || typeof headers !== 'object') return undefined

  const direct = headers[name] ?? headers[name.toLowerCase()]
  if (typeof direct === 'string') return direct
  if (Array.isArray(direct)) return direct[0]
  return undefined
}

const getEmailLanguage = (source) => {
  const explicitLanguage = getHeader(source, 'x-app-language')?.toLowerCase()
  if (SUPPORTED_EMAIL_LANGUAGES.includes(explicitLanguage)) {
    return explicitLanguage
  }

  const acceptLanguage = getHeader(source, 'accept-language')
  if (!acceptLanguage) return 'de'

  for (const part of acceptLanguage.split(',')) {
    const baseLanguage = part.trim().split(';')[0]?.split('-')[0]?.toLowerCase()
    if (SUPPORTED_EMAIL_LANGUAGES.includes(baseLanguage)) {
      return baseLanguage
    }
  }

  return 'de'
}

const logEmailLanguageDecision = ({ source, resolvedLanguage, kind, type }) => {
  console.info('[auth-email-language]', {
    kind,
    type,
    resolvedLanguage,
    explicitLanguage: getHeader(source, 'x-app-language') ?? null,
    acceptLanguage: getHeader(source, 'accept-language') ?? null,
    origin: getHeader(source, 'origin') ?? null,
    referer: getHeader(source, 'referer') ?? null,
  })
}

const otpEmailMessages = {
  de: {
    actions: {
      'sign-in': 'um dich anzumelden',
      'email-verification': 'um deine E-Mail-Adresse zu bestätigen',
      'forget-password': 'um dein Passwort zurückzusetzen',
      'two-factor': 'um die Zwei-Faktor-Authentifizierung abzuschliessen',
      default: 'um fortzufahren',
    },
    subject: (action) => `Dein Einmal-Code für Promote Species (${action})`,
    text: (otp, action) =>
      `Dein Einmal-Code lautet: ${otp}\n\nVerwende diesen Code, ${action}. Der Code läuft in wenigen Minuten ab.`,
  },
  en: {
    actions: {
      'sign-in': 'to sign in',
      'email-verification': 'to verify your email',
      'forget-password': 'to reset your password',
      'two-factor': 'for two-factor authentication',
      default: 'to continue',
    },
    subject: (action) => `Your one-time code for Promote Species (${action})`,
    text: (otp, action) =>
      `Your one-time code is: ${otp}\n\nUse this code ${action}. The code expires in a few minutes.`,
  },
  fr: {
    actions: {
      'sign-in': 'vous connecter',
      'email-verification': 'vérifier votre adresse e-mail',
      'forget-password': 'réinitialiser votre mot de passe',
      'two-factor': "terminer l'authentification à deux facteurs",
      default: 'continuer',
    },
    subject: (action) =>
      `Votre code à usage unique pour Promote Species (${action})`,
    text: (otp, action) =>
      `Votre code à usage unique est: ${otp}\n\nUtilisez ce code pour ${action}. Le code expire dans quelques minutes.`,
  },
  it: {
    actions: {
      'sign-in': 'accedere',
      'email-verification': 'verificare la tua e-mail',
      'forget-password': 'reimpostare la tua password',
      'two-factor': "completare l'autenticazione a due fattori",
      default: 'continuare',
    },
    subject: (action) =>
      `Il tuo codice monouso per Promote Species (${action})`,
    text: (otp, action) =>
      `Il tuo codice monouso è: ${otp}\n\nUsa questo codice per ${action}. Il codice scade tra pochi minuti.`,
  },
}

const resetPasswordEmailMessages = {
  de: {
    subject: 'Setze dein Passwort für Promote Species zurück',
    text: (url) =>
      `Klicke auf den folgenden Link, um dein Passwort zurückzusetzen:\n\n${url}\n\nDieser Link läuft in 1 Stunde ab.\n\nFalls du dies nicht angefordert hast, kannst du diese E-Mail ignorieren.`,
  },
  en: {
    subject: 'Reset your password for Promote Species',
    text: (url) =>
      `Click the link below to reset your password:\n\n${url}\n\nThis link expires in 1 hour.\n\nIf you did not request this, you can safely ignore this email.`,
  },
  fr: {
    subject: 'Réinitialisez votre mot de passe pour Promote Species',
    text: (url) =>
      `Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe:\n\n${url}\n\nCe lien expire dans 1 heure.\n\nSi vous n'avez pas demandé cela, vous pouvez ignorer cet e-mail.`,
  },
  it: {
    subject: 'Reimposta la tua password per Promote Species',
    text: (url) =>
      `Fai clic sul link qui sotto per reimpostare la tua password:\n\n${url}\n\nQuesto link scade tra 1 ora.\n\nSe non hai richiesto questa operazione, puoi ignorare questa e-mail.`,
  },
}

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

const buildOtpMessage = ({ otp, type, source }) => {
  const language = getEmailLanguage(source)
  logEmailLanguageDecision({
    source,
    resolvedLanguage: language,
    kind: 'otp',
    type,
  })
  const dictionary = otpEmailMessages[language] ?? otpEmailMessages.de
  const action = dictionary.actions[type] ?? dictionary.actions.default

  return {
    subject: dictionary.subject(action),
    text: dictionary.text(otp, action),
  }
}

const buildResetPasswordMessage = ({ url, source }) => {
  const language = getEmailLanguage(source)
  logEmailLanguageDecision({
    source,
    resolvedLanguage: language,
    kind: 'reset-password',
  })
  const dictionary =
    resetPasswordEmailMessages[language] ?? resetPasswordEmailMessages.de

  return {
    subject: dictionary.subject,
    text: dictionary.text(url),
  }
}

const mailgunClient = MAILGUN_API_KEY
  ? new Mailgun(FormData).client({
      username: 'api',
      key: MAILGUN_API_KEY,
      ...(MAILGUN_BASE_URL ? { url: MAILGUN_BASE_URL } : {}),
    })
  : null

const sendOtpEmail = async ({ email, otp, type, source }) => {
  const { subject, text } = buildOtpMessage({ otp, type, source })
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
      const { subject, text } = buildResetPasswordMessage({
        url,
        source: request,
      })
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
          subject,
          text,
        })
      } catch (error) {
        throw new Error(
          `mailgun password reset email send failed: ${String(error)}`,
        )
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
        async sendOTP({ user, otp }, ctx) {
          if (!user?.email) {
            throw new Error('two-factor otp send failed: missing user email')
          }
          await sendOtpEmail({
            email: user.email,
            otp,
            type: 'two-factor',
            source: ctx,
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
      async sendVerificationOTP({ email, otp, type }, ctx) {
        await sendOtpEmail({ email, otp, type, source: ctx })
      },
    }),
    passkey({
      rpID: PASSKEY_RP_ID,
      rpName: PASSKEY_RP_NAME,
      origin: PASSKEY_ORIGIN,
      schema: {
        passkey: {
          modelName: 'auth_passkeys',
          fields: {
            id: 'auth_passkey_id',
            name: 'name',
            publicKey: 'public_key',
            userId: 'user_id',
            credentialID: 'credential_id',
            counter: 'counter',
            deviceType: 'device_type',
            backedUp: 'backed_up',
            transports: 'transports',
            createdAt: 'created_at',
            aaguid: 'aaguid',
          },
        },
      },
    }),
  ],
  socialProviders,
  user: {
    deleteUser: { enabled: true },
    modelName: 'users',
    fields: {
      // do I need to set how the id is generated?
      id: 'user_id',
      name: 'name',
      email: 'email',
      image: 'image',
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
