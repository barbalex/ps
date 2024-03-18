import { useCallback, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { Node } from './Node'
import { Occurrence_imports as OccurrenceImport } from '../../../generated/client'

interface Props {
  project_id: string
  subproject_id: string
  occurrenceImport: OccurrenceImport
  level?: number
}

export const OccurrenceImportNode = memo(
  ({ project_id, subproject_id, occurrenceImport, level = 6 }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'subprojects' &&
      urlPath[3] === subproject_id &&
      urlPath[4] === 'occurrence-imports' &&
      urlPath[5] === occurrenceImport.occurrence_import_id
    const isActive = isOpen && urlPath.length === level

    const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}/occurrence-imports`

    const onClickButton = useCallback(() => {
      if (isOpen) {
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/${occurrenceImport.occurrence_import_id}`,
        search: searchParams.toString(),
      })
    }, [
      isOpen,
      navigate,
      baseUrl,
      occurrenceImport.occurrence_import_id,
      searchParams,
    ])

    return (
      <Node
        node={occurrenceImport}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={10}
        to={`${baseUrl}/${occurrenceImport.occurrence_import_id}`}
        onClickButton={onClickButton}
      />
    )
  },
)
