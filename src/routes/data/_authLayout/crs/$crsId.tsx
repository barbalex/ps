import { createFileRoute } from '@tanstack/react-router'

import { CRS } from '../../../../formsAndLists/crs/index.tsx'

export const Route = createFileRoute('/data/_authLayout/crs/$crsId')({
  component: CRS,
})
