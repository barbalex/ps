import { createFileRoute } from '@tanstack/react-router'

import { Qc } from '../../../formsAndLists/qc'

export const Route = createFileRoute('/data/qcs/$qcsId')({
  component: Qc,
  beforeLoad: ({ params }) => {
    if (!params.qcsId || params.qcsId === 'undefined') {
      throw new Error('Invalid or missing qcsId in route parameters')
    }
    return {
      navDataFetcher: 'useQcNavData',
    }
  },
})
