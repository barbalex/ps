import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { Node } from './Node.tsx'
import { OccurrenceNotToAssignNode } from './OccurrenceNotToAssign.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom } from '../../store.ts'

interface Props {
  project_id: string
  subproject_id: string
  level?: number
}

export const OccurrencesNotToAssignNode = memo(
  ({ project_id, subproject_id, level = 5 }: Props) => {
    const [openNodes] = useAtom(treeOpenNodesAtom)
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const db = usePGlite()
    const { results: occurrenceImports = [] } = useLiveQuery(
      db.occurrence_imports.liveMany({
        where: { subproject_id },
      }),
    )
    const { results: occurrences = [] } = useLiveQuery(
      db.occurrences.liveMany({
        where: {
          occurrence_import_id: {
            in: occurrenceImports.map((o) => o.occurrence_import_id),
          },
          not_to_assign: true,
        },
        orderBy: { label: 'asc' },
      }),
    )

    const occurrencesNode = useMemo(
      () => ({ label: `Occurrences not to assign (${occurrences.length})` }),
      [occurrences.length],
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const parentArray = useMemo(
      () => ['data', 'projects', project_id, 'subprojects', subproject_id],
      [project_id, subproject_id],
    )
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = useMemo(
      () => [...parentArray, 'occurrences-not-to-assign'],
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
          navigate({
            pathname: parentUrl,
            search: searchParams.toString(),
          })
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
      parentArray,
      parentUrl,
      searchParams,
      urlPath.length,
    ])

    return (
      <>
        <Node
          node={occurrencesNode}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isInActiveNodeArray}
          isActive={isActive}
          childrenCount={occurrences.length}
          to={ownUrl}
          onClickButton={onClickButton}
        />
        {isOpen &&
          occurrences.map((occurrence) => (
            <OccurrenceNotToAssignNode
              key={occurrence.occurrence_id}
              project_id={project_id}
              subproject_id={subproject_id}
              occurrence={occurrence}
              level={level + 1}
            />
          ))}
      </>
    )
  },
)
