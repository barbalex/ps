import { createFileRoute } from '@tanstack/react-router'

import { Fields } from '../../../formsAndLists/fields.tsx'
import { NotFound } from '../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/fields/')({
  component: () => <Fields />,
  notFoundComponent: NotFound,
})
