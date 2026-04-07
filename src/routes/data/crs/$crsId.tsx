import { createFileRoute } from '@tanstack/react-router'

import { CRS } from '../../../formsAndLists/crs'

export const Route = createFileRoute('/data/crs/$crsId')({
  component: CRS,
  beforeLoad: ({ params }) => {
    if (!params.crsId || params.crsId === 'undefined') {
      throw new Error('Invalid or missing crsId in route parameters')
    }
    return {
      navDataFetcher: 'useCrsNavData',
    }
  },
})
