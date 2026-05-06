import { createFileRoute } from '@tanstack/react-router'

import { Export } from '../../../formsAndLists/export/index.tsx'

export const Route = createFileRoute('/data/exports/$exportsId')({
  component: Export,
  beforeLoad: ({ params }) => {
    if (!params.exportsId || params.exportsId === 'undefined') {
      throw new Error('Invalid or missing exportsId in route parameters')
    }
    return {
      navDataFetcher: 'useExportNavData',
    }
  },
})
