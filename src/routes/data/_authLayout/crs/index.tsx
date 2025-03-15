import { createFileRoute } from '@tanstack/react-router'

import { CRSS } from '../../../../formsAndLists/crss/index.tsx'
import { NotFound } from '../../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/_authLayout/crs/')({
  component: CRSS,
  notFoundComponent: NotFound,
})
