import { createFileRoute } from '@tanstack/react-router'

import { AppStates } from '../../formsAndLists/appStates'

export const Route = createFileRoute('/data/app-states')({
  component: AppStates,
})
