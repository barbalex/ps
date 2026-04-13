const parseEmails = (emails: string | undefined) =>
  new Set(
    (emails ?? '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  )

export const appAdminEmails = parseEmails(import.meta.env.VITE_APP_ADMIN_EMAILS)

export const isAppAdminEmail = (email?: string | null) => {
  const normalizedEmail = email?.trim().toLowerCase()
  console.log('Checking if email is app admin:', {
    email,
    normalizedEmail,
    appAdminEmails,
  })
  return Boolean(normalizedEmail && appAdminEmails.has(normalizedEmail))
}
