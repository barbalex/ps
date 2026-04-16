import { createFileRoute } from '@tanstack/react-router'

import { NotFound } from '../../../components/NotFound.tsx'
import { DocsList } from '../../../formsAndLists/docs.tsx'

export const Route = createFileRoute('/_layout/docs/')({
  component: DocsList,
  notFoundComponent: NotFound,
})
