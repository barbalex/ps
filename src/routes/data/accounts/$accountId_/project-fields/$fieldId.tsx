import { createFileRoute } from '@tanstack/react-router'

import { Field } from '../../../../../formsAndLists/field/index.tsx'

const from = '/data/accounts/$accountId_/project-fields/$fieldId'

export const Route = createFileRoute(from)({
  component: () => <Field from={from} />,
  beforeLoad: ({ params }) => {
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
