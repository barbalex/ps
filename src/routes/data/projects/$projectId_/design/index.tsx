import { createFileRoute } from '@tanstack/react-router'

import { Design } from '../../../../../formsAndLists/project/Design/index.tsx'
import { NotFound } from '../../../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/projects/$projectId_/design/')({
  component: RouteComponent,
  notFoundComponent: NotFound,
})

const RouteComponent = () => {
  return <Design from={'/data/projects/$projectId_/design'} />
}
