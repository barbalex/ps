import { createFileRoute } from '@tanstack/react-router'

import { UserFilter } from '../../../formsAndLists/user/Filter.tsx'

const from = '/data/users/filter'

export const Route = createFileRoute(from)({
  component: () => <UserFilter from={from} />,
})
