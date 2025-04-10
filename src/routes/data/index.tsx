import { createFileRoute } from '@tanstack/react-router'

import { RootList } from '../../formsAndLists/root/List.tsx'
import { NotFound } from '../../components/NotFound.tsx'

export const Route = createFileRoute('/data/')({
  component: RootList,
  notFoundComponent: NotFound,
})
