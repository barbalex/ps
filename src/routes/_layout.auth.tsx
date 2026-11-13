import { createFileRoute } from '@tanstack/react-router'

import { Auth } from '../components/Auth/index.tsx'

// plain validator instead of an arktype schema: this route's search segment
// is part of the eager entry chunk, and arktype + @ark/schema (~30 KB gz)
// came along with it. The params are only ever set programmatically (as
// proper types), so permissive coercion is safe.
type AuthSearch = {
  redirect?: string
  verificationExpired?: boolean
}
const validateSearch = (search: Record<string, unknown>): AuthSearch => ({
  redirect:
    typeof search.redirect === 'string' ? search.redirect : '/data/projects',
  verificationExpired: search.verificationExpired === true,
})

export const Route = createFileRoute('/_layout/auth')({
  component: Auth,
  validateSearch,
})
