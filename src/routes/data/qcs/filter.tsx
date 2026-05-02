import { createFileRoute } from '@tanstack/react-router'

import { QcFilter } from '../../../formsAndLists/qc/Filter.tsx'

const from = '/data/qcs/filter'

export const Route = createFileRoute('/data/qcs/filter')({
  component: () => <QcFilter from={from} />,
})
