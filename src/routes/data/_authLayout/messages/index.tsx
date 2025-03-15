import { createFileRoute } from '@tanstack/react-router'

import { Messages } from '../../../../formsAndLists/messages.tsx'

export const Route = createFileRoute('/data/_authLayout/messages/')({
  component: Messages,
})
