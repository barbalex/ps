import { createFileRoute, redirect } from '@tanstack/react-router'

import { Field } from '../../../../../../../formsAndLists/field/index.tsx'

const from = '/data/users/$userId_/accounts/$accountId_/project-fields/$fieldId'

export const Route = createFileRoute(from)({
  component: () => <Field from={from} />,
  beforeLoad: ({ params }) => {
    const userId = params.userId ?? params.userId_
    const accountId = params.accountId ?? params.accountId_
    const fieldId = params.fieldId ?? params.fieldId_
    if (!userId || userId === 'undefined') {
      throw redirect({ to: '/data/users' })
    }
    if (!accountId || accountId === 'undefined') {
      throw redirect({
        to: '/data/users/$userId_/accounts/',
        params: { userId },
      })
    }
    if (!fieldId || fieldId === 'undefined') {
      throw redirect({
        to: '/data/users/$userId_/accounts/$accountId_/project-fields/',
        params: { userId, accountId },
      })
    }
    return {
      navDataFetcher: 'useFieldNavData',
    }
  },
})
