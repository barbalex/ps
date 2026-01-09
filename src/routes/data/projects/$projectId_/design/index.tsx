import { createFileRoute, stripSearchParams } from '@tanstack/react-router'
import { type } from 'arktype'

import { Design } from '../../../../../formsAndLists/project/Design/index.tsx'

const defaultValues = {
  projectTab: 'form',
  editingField: undefined,
}

const schema = type({
  projectTab: "'form' | 'design' = 'form'",
  editingField: 'string.uuid.v7 | undefined = undefined',
})

export const Route = createFileRoute(
  '/data/projects/$projectId_/design/',
)({
  component: RouteComponent,
  validateSearch: schema,
  middlewares: [stripSearchParams(defaultValues)],
})

const RouteComponent = () => {
  return <Design from={'/data/projects/$projectId_/design'} />
}
