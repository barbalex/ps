import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { OccurrenceImportNode } from './OccurrenceImport.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'

interface Props {
  project_id: string
  subproject_id: string
  level?: number
}

export const OccurrenceImportsNode = memo(
  ({ project_id, subproject_id, level = 5 }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user: authUser } = useCorbado()

    const { db } = useElectric()!
    const { results: occurrenceImports = [] } = useLiveQuery(
      db.occurrence_imports.liveMany({
        where: { subproject_id },
        orderBy: { label: 'asc' },
      }),
    )
    const { results: appState } = useLiveQuery(
      db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
    )

    const node = useMemo(
      () => ({ label: `Occurrence Imports (${occurrenceImports.length})` }),
      [occurrenceImports.length],
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[1] === 'projects' &&
      urlPath[2] === project_id &&
      urlPath[3] === 'subprojects' &&
      urlPath[4] === subproject_id &&
      urlPath[5] === 'occurrence-imports'
    const isActive = isOpen && urlPath.length === level

    const baseArray = useMemo(
      () => ['projects', project_id, 'subprojects', subproject_id],
      [project_id, subproject_id],
    )
    const baseUrl = baseArray.join('/')

    const onClickButton = useCallback(() => {
      if (isOpen) {
        removeChildNodes({
          node: [...baseArray, 'occurrence-imports'],
          db,
          appStateId: appState?.app_state_id,
        })
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/occurrence-imports`,
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
          node={node}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isOpen}
          isActive={isActive}
          childrenCount={occurrenceImports.length}
          to={`${baseUrl}/occurrence-imports`}
          onClickButton={onClickButton}
        />
        {isOpen &&
          occurrenceImports.map((occurrenceImport) => (
            <OccurrenceImportNode
              key={occurrenceImport.occurrence_import_id}
              project_id={project_id}
              subproject_id={subproject_id}
              occurrenceImport={occurrenceImport}
            />
          ))}
      </>
    )
  },
)
