import { createFileRoute } from '@tanstack/react-router'

import { RootList } from '../../../formsAndLists/root/List.tsx'

export const Route = createFileRoute('/data/_authLayout/')({
  component: RootList,
})
