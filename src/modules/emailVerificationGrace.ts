export const EMAIL_VERIFICATION_GRACE_MS = 60 * 60 * 1000

type SessionUserLike = {
  emailVerified?: boolean | null
  createdAt?: string | null
}

export const getVerificationDeadlineMs = (user?: SessionUserLike | null) => {
  if (!user || user.emailVerified) return null

  const createdAtMs = Date.parse(user.createdAt ?? '')
  if (Number.isNaN(createdAtMs)) return null

  return createdAtMs + EMAIL_VERIFICATION_GRACE_MS
}

export const isVerificationGraceExpired = (
  user?: SessionUserLike | null,
  nowMs = Date.now(),
) => {
  const deadlineMs = getVerificationDeadlineMs(user)
  if (!deadlineMs) return false
  return nowMs >= deadlineMs
}
