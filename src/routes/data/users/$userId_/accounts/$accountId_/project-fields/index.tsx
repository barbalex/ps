import { createFileRoute } from '@tanstack/react-router'

import { Fields } from '../../../../../../../formsAndLists/fields.tsx'
import { NotFound } from '../../../../../../../components/NotFound.tsx'

const from = '/data/users/$userId_/accounts/$accountId_/project-fields/'

export const Route = createFileRoute('/data/users/$userId_/accounts/$accountId_/project-fields/')({
  component: () => <Fields from={from} />,
  notFoundComponent: NotFound,
})
