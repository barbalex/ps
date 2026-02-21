import { createFileRoute } from '@tanstack/react-router'

import { Field } from '../../../formsAndLists/field/index.tsx'
const from = '/data/fields/$fieldId'

export const Route = createFileRoute(from)({
  component: () => <Field from="/data/fields/$fieldId" />,
  beforeLoad: ({ params }) => {
    if (!params.fieldId || params.fieldId === 'undefined') {
      throw new Error('Invalid or missing fieldId in route parameters')
    }
    return {
      navDataFetcher: 'useFieldNavData',
    }
  },
})
