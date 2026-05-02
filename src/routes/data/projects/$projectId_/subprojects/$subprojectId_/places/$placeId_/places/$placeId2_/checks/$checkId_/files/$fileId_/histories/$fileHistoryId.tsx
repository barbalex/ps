import { createFileRoute } from '@tanstack/react-router'

import { FileHistoryCompare } from '../../../../../../../../../../../../../../../formsAndLists/file/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/checks/$checkId_/files/$fileId_/histories/$fileHistoryId'

export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/checks/$checkId_/files/$fileId_/histories/$fileHistoryId')({
  component: () => <FileHistoryCompare from={from} />,
})
