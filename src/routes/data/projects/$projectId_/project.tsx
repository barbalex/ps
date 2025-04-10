import { createFileRoute, stripSearchParams } from '@tanstack/react-router'
import { type } from 'arktype'

import { Project } from '../../../../formsAndLists/project/index.tsx'
import { NotFound } from '../../../../components/NotFound.tsx'

const defaultValues = {
  projectTab: 'form',
  editingField: undefined,
}

const schema = type({
  projectTab: "'form' | 'design' = 'form'",
  editingField: 'string.uuid.v7 | undefined = undefined',
})

export const Route = createFileRoute('/data/projects/$projectId_/project')({
  component: RouteComponent,
  validateSearch: schema,
  middlewares: [stripSearchParams(defaultValues)],
  notFoundComponent: NotFound,
})

const RouteComponent = () => {
  return <Project from={'/data/projects/$projectId_/project'} />
}
