import { createFileRoute } from '@tanstack/react-router'

import { Field } from '../../../../../formsAndLists/field/index.tsx'
const from = '/data/projects/$projectId_/fields/$fieldId'

export const Route = createFileRoute(from)({
  component: () => <Field from="/data/projects/$projectId_/fields/$fieldId" />,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.fieldId || params.fieldId === 'undefined') {
      throw new Error('Invalid or missing fieldId in route parameters')
    }
    return {
      navDataFetcher: 'useFieldNavData',
    }
  },
})
