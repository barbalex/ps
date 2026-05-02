import { createFileRoute } from '@tanstack/react-router'

import { ListList } from '../../../../../../formsAndLists/list/List.tsx'

export const Route = createFileRoute('/data/projects/$projectId_/lists/$listId_/')({
  component: () => (
    <ListList from="/data/projects/$projectId_/lists/$listId_/" />
  ),
})
