import { createFileRoute } from '@tanstack/react-router'

import { ProjectFilter } from '../../../formsAndLists/project/Filter.tsx'

const from = '/data/projects/filter'

export const Route = createFileRoute('/data/projects/filter')({
  component: () => <ProjectFilter from={from} />,
})
