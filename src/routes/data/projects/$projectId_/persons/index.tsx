import { createFileRoute } from '@tanstack/react-router'

import { Persons } from '../../../../../formsAndLists/persons.tsx'
import { NotFound } from '../../../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/projects/$projectId_/persons/')({
  component: Persons,
  notFoundComponent: NotFound,
})
