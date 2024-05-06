import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node'
import { OccurrenceImportNode } from './OccurrenceImport'

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

    const { db } = useElectric()!
    const { results: occurrenceImports = [] } = useLiveQuery(
      db.occurrence_imports.liveMany({
        where: { subproject_id },
        orderBy: { label: 'asc' },
      }),
    )

    const node = useMemo(
      () => ({ label: `Occurrence Imports (${occurrenceImports.length})` }),
      [occurrenceImports.length],
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'subprojects' &&
      urlPath[3] === subproject_id &&
      urlPath[4] === 'occurrence-imports'
    const isActive = isOpen && urlPath.length === level

    const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}`

    const onClickButton = useCallback(() => {
      if (isOpen) {
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/occurrence-imports`,
        search: searchParams.toString(),
      })
    }, [baseUrl, isOpen, navigate, searchParams])

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
