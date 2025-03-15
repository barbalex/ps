import { createFileRoute } from '@tanstack/react-router'

import { AppStates } from '../../../formsAndLists/appStates.tsx'

export const Route = createFileRoute('/data/_authLayout/app-states')({
  component: AppStates,
})
