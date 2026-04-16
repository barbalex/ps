import { createFileRoute } from '@tanstack/react-router'

import { NotFound } from '../../../components/NotFound.tsx'
import { Doc } from '../../../formsAndLists/doc/index.tsx'

export const Route = createFileRoute('/_layout/docs/$docId')({
  component: Doc,
  notFoundComponent: NotFound,
})
