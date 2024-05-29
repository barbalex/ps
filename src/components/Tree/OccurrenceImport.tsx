import { useCallback, memo, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import { Node } from './Node.tsx'
import { Occurrence_imports as OccurrenceImport } from '../../../generated/client/index.ts'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { useElectric } from '../../ElectricProvider.tsx'

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
    const { user: authUser } = useCorbado()

    const { db } = useElectric()!
    const { results: appState } = useLiveQuery(
      db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[1] === 'projects' &&
      urlPath[2] === project_id &&
      urlPath[3] === 'subprojects' &&
      urlPath[4] === subproject_id &&
      urlPath[5] === 'occurrence-imports' &&
      urlPath[6] === occurrenceImport.occurrence_import_id
    const isActive = isOpen && urlPath.length === level + 1

    const baseArray = useMemo(
      () => [
        'data',
        'projects',
        project_id,
        'subprojects',
        subproject_id,
        'occurrence-imports',
      ],
      [project_id, subproject_id],
    )
    const baseUrl = baseArray.join('/')

    const onClickButton = useCallback(() => {
      if (isOpen) {
        removeChildNodes({
          node: [...baseArray, occurrenceImport.occurrence_import_id],
          db,
          appStateId: appState?.app_state_id,
        })
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
      baseArray,
      db,
      appState?.app_state_id,
    ])

    return (
      <Node
        node={occurrenceImport}
        id={occurrenceImport.occurrence_import_id}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={0}
        to={`${baseUrl}/${occurrenceImport.occurrence_import_id}`}
        onClickButton={onClickButton}
      />
    )
  },
)
