import { createFileRoute } from '@tanstack/react-router'
import { type } from 'arktype'

import { Project } from '../../../../formsAndLists/project/index.tsx'

const schema = type({
  projectTab: `string = 'form'`,
})

export const Route = createFileRoute('/data/_authLayout/projects/$projectId')({
  component: Component,
  validateSearch: schema,
})

function Component() {
  return <Project Route={Route} />
}
