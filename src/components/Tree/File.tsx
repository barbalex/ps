import { useCallback, useMemo, memo } from 'react'
import {
  useLocation,
  useParams,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import isEqual from 'lodash/isEqual'

import { Node } from './Node.tsx'
import { Files as File } from '../../../generated/client/index.ts'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { useElectric } from '../../ElectricProvider.tsx'

interface Props {
  project_id?: string
  subproject_id?: string
  file: File
  level: number
}

export const FileNode = memo(
  ({
    project_id,
    subproject_id,
    place_id,
    place_id2,
    check_id,
    action_id,
    file,
    level = 2,
  }: Props) => {
    const params = useParams()
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user: authUser } = useCorbado()

    const { db } = useElectric()!
    const { results: appState } = useLiveQuery(
      db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
    )

    const isPreview = location.pathname.endsWith('/preview')
    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      place_id2 && action_id
        ? urlPath[1] === 'projects' &&
          urlPath[2] === project_id &&
          urlPath[3] === 'subprojects' &&
          urlPath[4] === subproject_id &&
          urlPath[5] === 'places' &&
          urlPath[6] === place_id &&
          urlPath[7] === 'places' &&
          urlPath[8] === place_id2 &&
          urlPath[9] === 'actions' &&
          urlPath[10] === action_id &&
          urlPath[11] === 'files' &&
          params.file_id === file.file_id
        : place_id2 && check_id
        ? urlPath[1] === 'projects' &&
          urlPath[2] === project_id &&
          urlPath[3] === 'subprojects' &&
          urlPath[4] === subproject_id &&
          urlPath[5] === 'places' &&
          urlPath[6] === place_id &&
          urlPath[7] === 'places' &&
          urlPath[8] === place_id2 &&
          urlPath[9] === 'checks' &&
          urlPath[10] === check_id &&
          urlPath[11] === 'files' &&
          params.file_id === file.file_id
        : !place_id2 && action_id
        ? urlPath[1] === 'projects' &&
          urlPath[2] === project_id &&
          urlPath[3] === 'subprojects' &&
          urlPath[4] === subproject_id &&
          urlPath[5] === 'places' &&
          urlPath[6] === place_id &&
          urlPath[7] === 'actions' &&
          urlPath[8] === action_id &&
          urlPath[9] === 'files' &&
          params.file_id === file.file_id
        : !place_id2 && check_id
        ? urlPath[1] === 'projects' &&
          urlPath[2] === project_id &&
          urlPath[3] === 'subprojects' &&
          urlPath[4] === subproject_id &&
          urlPath[5] === 'places' &&
          urlPath[6] === place_id &&
          urlPath[7] === 'checks' &&
          urlPath[8] === check_id &&
          urlPath[9] === 'files' &&
          params.file_id === file.file_id
        : place_id2
        ? urlPath[1] === 'projects' &&
          urlPath[2] === project_id &&
          urlPath[3] === 'subprojects' &&
          urlPath[4] === subproject_id &&
          urlPath[5] === 'places' &&
          urlPath[6] === place_id &&
          urlPath[7] === 'places' &&
          urlPath[8] === place_id2 &&
          urlPath[9] === 'files' &&
          params.file_id === file.file_id
        : place_id
        ? urlPath[1] === 'projects' &&
          urlPath[2] === project_id &&
          urlPath[3] === 'subprojects' &&
          urlPath[4] === subproject_id &&
          urlPath[5] === 'places' &&
          urlPath[6] === place_id &&
          urlPath[7] === 'files' &&
          params.file_id === file.file_id
        : subproject_id
        ? urlPath[1] === 'projects' &&
          urlPath[2] === project_id &&
          urlPath[3] === 'subprojects' &&
          urlPath[4] === subproject_id &&
          urlPath[5] === 'files' &&
          params.file_id === file.file_id
        : project_id
        ? urlPath[1] === 'projects' &&
          urlPath[2] === project_id &&
          urlPath[3] === 'files' &&
          params.file_id === file.file_id
        : urlPath[1] === 'files' && params.file_id === file.file_id
    const isActive = isOpen && urlPath.length === level + 1

    const baseArray = useMemo(
      () => [
        'data',
        ...(project_id ? ['projects', project_id] : []),
        ...(subproject_id ? ['subprojects', subproject_id] : []),
        ...(place_id ? ['places', place_id] : []),
        ...(place_id2 ? ['places', place_id2] : []),
        ...(action_id ? ['actions', action_id] : []),
        ...(check_id ? ['checks', check_id] : []),
        'files',
      ],
      [action_id, check_id, place_id, place_id2, project_id, subproject_id],
    )
    const baseUrl = baseArray.join('/')

    const onClickButton = useCallback(() => {
      if (isOpen) {
        removeChildNodes({
          node: [...baseArray, file.file_id],
          db,
          appStateId: appState?.app_state_id,
        })
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/${file.file_id}`,
        search: searchParams.toString(),
      })
    }, [
      isOpen,
      navigate,
      baseUrl,
      file.file_id,
      searchParams,
      baseArray,
      db,
      appState?.app_state_id,
    ])

    return (
      <Node
        node={file}
        id={file.file_id}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={0}
        to={`${baseUrl}/${file.file_id}${isPreview ? '/preview' : ''}`}
        onClickButton={onClickButton}
      />
    )
  },
)
