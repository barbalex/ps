import { memo, useMemo } from 'react'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { Node } from './Node.tsx'

export const OccurrenceImportNode = memo(
  ({ projectId, subprojectId, occurrenceImport, level = 6 }) => {
    const location = useLocation()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const ownArray = useMemo(
      () => [
        'data',
        'projects',
        projectId,
        'subprojects',
        subprojectId,
        'occurrence-imports',
        occurrenceImport.occurrence_import_id,
      ],
      [occurrenceImport.occurrence_import_id, projectId, subprojectId],
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
