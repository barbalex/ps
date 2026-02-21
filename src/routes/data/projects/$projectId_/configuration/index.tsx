import { createFileRoute } from '@tanstack/react-router'

import { Configuration } from '../../../../../formsAndLists/project/Configuration/index.tsx'
import { NotFound } from '../../../../../components/NotFound.tsx'
const from = '/data/projects/$projectId_/configuration/'

export const Route = createFileRoute(from)({
  component: () => (
    <Configuration from={'/data/projects/$projectId_/configuration'} />
  ),
  notFoundComponent: NotFound,
})
