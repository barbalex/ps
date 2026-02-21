import { createFileRoute, useParams } from '@tanstack/react-router'

import { Files } from '../../../../../formsAndLists/files.tsx'
import { NotFound } from '../../../../../components/NotFound.tsx'
const from = '/data/projects/$projectId_/files/'

export const Route = createFileRoute(from)({
  component: () => {
    const { projectId } = useParams({
      from,
    })

    return <Files projectId={projectId} />
  },
  notFoundComponent: NotFound,
})
