import { useCallback, useMemo, memo } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'
import { useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { Node } from './Node.tsx'
import { OccurrenceToAssessNode } from './OccurrenceToAssess.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { formatNumber } from '../../modules/formatNumber.ts'
import { treeOpenNodesAtom } from '../../store.ts'
import { useOccurrencesNavData } from '../../modules/useOccurrencesNavData.ts'

interface Props {
  projectId: string
  subprojectId: string
  level?: number
}

export const OccurrencesToAssessNode = memo(
  ({ projectId, subprojectId, level = 5 }: Props) => {
    const [openNodes] = useAtom(treeOpenNodesAtom)
    const location = useLocation()
    const navigate = useNavigate()

    const res = useLiveIncrementalQuery(
      `
        SELECT 
          o.occurrence_id,
          o.label 
        FROM 
          occurrences o 
          INNER JOIN occurrence_imports oi 
            ON o.occurrence_import_id = oi.occurrence_import_id 
        WHERE 
          oi.subproject_id = $1
          AND o.not_to_assign IS NOT TRUE 
          AND o.place_id IS NULL
        ORDER BY 
          o.label
      `,
      [subprojectId],
      'occurrence_id',
    )
    const rows = res?.rows ?? []
    const loading = res === undefined

    const node = useMemo(
      () => ({
        label: `Occurrences to assess (${
          loading ? '...' : formatNumber(rows.length)
        })`,
      }),
      [loading, rows.length],
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const parentArray = useMemo(
      () => ['data', 'projects', projectId, 'subprojects', subprojectId],
      [projectId, subprojectId],
    )
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = useMemo(
      () => [...parentArray, 'occurrences-to-assess'],
      [parentArray],
    )
    const ownUrl = `/${ownArray.join('/')}`

    // needs to work not only works for urlPath, for all opened paths!
    const isOpen = openNodes.some((array) => isEqual(array, ownArray))
    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    const onClickButton = useCallback(() => {
      if (isOpen) {
        removeChildNodes({ node: ownArray })
        // only navigate if urlPath includes ownArray
        if (isInActiveNodeArray && ownArray.length <= urlPath.length) {
          navigate({ to: parentUrl })
        }
        return
      }
      // add to openNodes without navigating
      addOpenNodes({ nodes: [ownArray] })
    }, [
      isInActiveNodeArray,
      isOpen,
      navigate,
      ownArray,
      parentUrl,
      urlPath.length,
    ])

    return (
      <>
        <Node
          node={node}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isInActiveNodeArray}
          isActive={isActive}
          childrenCount={rows.length}
          to={ownUrl}
          onClickButton={onClickButton}
        />
        {isOpen &&
          rows.map((occurrence) => (
            <OccurrenceToAssessNode
              key={occurrence.occurrence_id}
              projectId={projectId}
              subprojectId={subprojectId}
              occurrence={occurrence}
              level={level + 1}
            />
          ))}
      </>
    )
  },
)
