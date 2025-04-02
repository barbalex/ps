import { createFileRoute, stripSearchParams } from '@tanstack/react-router'
import { type } from 'arktype'

import { Project } from '../../../../../formsAndLists/project/index.tsx'

const defaultValues = {
  projectTab: 'form',
  editingField: undefined,
}

const schema = type({
  projectTab: "'form' | 'design' = 'form'",
  editingField: 'string.uuid.v7 | undefined = undefined',
})

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/project/',
)({
  component: Project,
    validateSearch: schema,
    middlewares: [stripSearchParams(defaultValues)],
})
