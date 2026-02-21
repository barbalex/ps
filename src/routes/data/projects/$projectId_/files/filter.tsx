import { createFileRoute } from '@tanstack/react-router'

import { FileFilter } from '../../../../../formsAndLists/file/Filter.tsx'

const from = '/data/projects/$projectId_/files/filter'

export const Route = createFileRoute(from)({
  component: () => <FileFilter from={from} />,
})
