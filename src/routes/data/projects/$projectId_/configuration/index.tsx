import { createFileRoute } from '@tanstack/react-router'

import { Configuration } from '../../../../../formsAndLists/project/Configuration/index.tsx'
import { NotFound } from '../../../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/projects/$projectId_/configuration/')({
  component: () => (
    <Configuration from={'/data/projects/$projectId_/configuration'} />
  ),
  notFoundComponent: NotFound,
})
