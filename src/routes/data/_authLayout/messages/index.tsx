import { createFileRoute } from '@tanstack/react-router'

import { MessagesChooser } from '../../../../formsAndLists/messages/index.tsx'
import { NotFound } from '../../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/_authLayout/messages/')({
  component: MessagesChooser,
  notFoundComponent: NotFound,
})
