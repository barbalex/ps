import { memo, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import isEqual from 'lodash/isEqual'

import { Node } from './Node.tsx'
import { Occurrence_imports as OccurrenceImport } from '../../../generated/client/index.ts'

interface Props {
  project_id: string
  subproject_id: string
  occurrenceImport: OccurrenceImport
  level?: number
}

export const OccurrenceImportNode = memo(
  ({ project_id, subproject_id, occurrenceImport, level = 6 }: Props) => {
    const location = useLocation()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const ownArray = useMemo(
      () => [
        'data',
        'projects',
        project_id,
        'subprojects',
        subproject_id,
        'occurrence-imports',
        occurrenceImport.occurrence_import_id,
      ],
      [occurrenceImport.occurrence_import_id, project_id, subproject_id],
    )
    const ownUrl = `/${ownArray.join('/')}`

    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    return (
      <Node
        node={occurrenceImport}
        id={occurrenceImport.occurrence_import_id}
        level={level}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={0}
        to={ownUrl}
      />
    )
  },
)
