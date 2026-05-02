import { createFileRoute } from '@tanstack/react-router'

import { ProjectList } from '../../../../formsAndLists/project/List.tsx'

const from = '/data/projects/$projectId_/'

export const Route = createFileRoute('/data/projects/$projectId_/')({
  component: () => <ProjectList from={from} />,
})
