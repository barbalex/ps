import { createFileRoute } from '@tanstack/react-router'

import { Fields } from '../../../../../formsAndLists/fields.tsx'
import { NotFound } from '../../../../../components/NotFound.tsx'
const from = '/data/projects/$projectId_/fields/'

export const Route = createFileRoute(from)({
  component: () => <Fields from="/data/projects/$projectId_/fields/" />,
  notFoundComponent: NotFound,
})
