import { createFileRoute, stripSearchParams } from '@tanstack/react-router'
import { type } from 'arktype'

import { ProjectList } from '../../../../formsAndLists/project/List.tsx'

const defaultValues = {
  projectTab: 'form',
  editingField: undefined,
}

const schema = type({
  projectTab: "'form' | 'design' = 'form'",
  editingField: 'string.uuid.v7 | undefined = undefined',
})

export const Route = createFileRoute('/data/_authLayout/projects/$projectId')({
  component: ProjectList,
  validateSearch: schema,
  middlewares: [stripSearchParams(defaultValues)],
})
