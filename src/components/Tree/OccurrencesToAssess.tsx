import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { OccurrenceToAssessNode } from './OccurrenceToAssess.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'

interface Props {
  project_id: string
  subproject_id: string
  level?: number
}

export const OccurrencesToAssessNode = memo(
  ({ project_id, subproject_id, level = 5 }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user: authUser } = useCorbado()

    const { db } = useElectric()!
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
          OR: [{ not_to_assign: null }, { not_to_assign: false }],
          // NOT: [{ not_to_assign: true }], // this does not work
          place_id: null,
        },
        orderBy: { label: 'asc' },
      }),
    )
    const { results: appState } = useLiveQuery(
      db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
    )

    const occurrencesNode = useMemo(
      () => ({ label: `Occurrences to assess (${occurrences.length})` }),
      [occurrences.length],
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[1] === 'projects' &&
      urlPath[2] === project_id &&
      urlPath[3] === 'subprojects' &&
      urlPath[4] === subproject_id &&
      urlPath[5] === 'occurrences-to-assess'
    const isActive = isOpen && urlPath.length === level + 1

    const baseArray = useMemo(
      () => ['data', 'projects', project_id, 'subprojects', subproject_id],
      [project_id, subproject_id],
    )
    const baseUrl = baseArray.join('/')

    const onClickButton = useCallback(() => {
      if (isOpen) {
        removeChildNodes({
          node: [...baseArray, 'occurrences-to-assess'],
          db,
          appStateId: appState?.app_state_id,
        })
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/occurrences-to-assess`,
        search: searchParams.toString(),
      })
    }, [
      appState?.app_state_id,
      baseArray,
      baseUrl,
      db,
      isOpen,
      navigate,
      searchParams,
    ])

    return (
      <>
        <Node
          node={occurrencesNode}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isOpen}
          isActive={isActive}
          childrenCount={occurrences.length}
          to={`${baseUrl}/occurrences-to-assess`}
          onClickButton={onClickButton}
        />
        {isOpen &&
          occurrences.map((occurrence) => (
            <OccurrenceToAssessNode
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
