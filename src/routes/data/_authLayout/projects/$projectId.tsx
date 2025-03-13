import { createFileRoute } from '@tanstack/react-router'
import { type } from 'arktype'

import { Project } from '../../../../formsAndLists/project/index.tsx'

const schema = type({
  projectTab: `string = 'form'`,
  editingField: `string = ''`,
})

export const Route = createFileRoute('/data/_authLayout/projects/$projectId')({
  component: Project,
  validateSearch: schema,
})
