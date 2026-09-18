import { createFileRoute, redirect } from '@tanstack/react-router'

import { Field } from '../../../../../../../formsAndLists/field/index.tsx'

const from = '/data/users/$userId_/accounts/$accountId_/project-fields/$fieldId'

export const Route = createFileRoute('/data/users/$userId_/accounts/$accountId_/project-fields/$fieldId')({
  component: () => <Field from={from} />,
  beforeLoad: ({ params }) => {
    const userId = params.userId
    const accountId = params.accountId
    const fieldId = params.fieldId
    if (!userId || userId === 'undefined') {
      throw redirect({ to: '/data/users' })
    }
    if (!accountId || accountId === 'undefined') {
      throw redirect({
        to: '/data/users/$userId/accounts',
        params: { userId },
      })
    }
    if (!fieldId || fieldId === 'undefined') {
      throw redirect({
        to: '/data/users/$userId/accounts/$accountId/project-fields',
        params: { userId, accountId },
      })
    }
    return {
      navDataFetcher: 'useFieldNavData',
    }
  },
})
