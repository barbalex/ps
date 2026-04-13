import { createFileRoute } from '@tanstack/react-router'

import { Field } from '../../../../../../../formsAndLists/field'

const from = '/data/users/$userId_/accounts/$accountId_/project-fields/$fieldId'

export const Route = createFileRoute(from)({
  component: () => <Field from={from} />,
  beforeLoad: ({ params }) => {
    if (!params.userId || params.userId === 'undefined') {
      throw new Error('Invalid or missing userId in route parameters')
    }
    if (!params.accountId || params.accountId === 'undefined') {
      throw new Error('Invalid or missing accountId in route parameters')
    }
    if (!params.fieldId || params.fieldId === 'undefined') {
      throw new Error('Invalid or missing fieldId in route parameters')
    }
    return {
      navDataFetcher: 'useFieldNavData',
    }
  },
})
