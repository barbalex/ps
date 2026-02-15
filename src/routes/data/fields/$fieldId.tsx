import { createFileRoute } from '@tanstack/react-router'

import { Field } from '../../../formsAndLists/field/index.tsx'

export const Route = createFileRoute('/data/fields/$fieldId')({
  component: RouteComponent,
  beforeLoad: ({ params }) => {
    if (!params.fieldId || params.fieldId === 'undefined') {
      throw new Error('Invalid or missing fieldId in route parameters')
    }
    return {
      navDataFetcher: 'useFieldNavData',
    }
  },
})

function RouteComponent() {
  return <Field from="/data/fields/$fieldId" />
}
