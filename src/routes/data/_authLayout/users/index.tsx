import { createFileRoute } from '@tanstack/react-router'

import { Users } from '../../../../formsAndLists/users.tsx'

export const Route = createFileRoute('/data/_authLayout/users/')({
  component: Users,
})
