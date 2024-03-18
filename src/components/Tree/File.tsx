import { useCallback } from 'react'
import {
  useLocation,
  useParams,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'

import { Node } from './Node'
import { Files as File } from '../../../generated/client'

interface Props {
  project_id?: string
  subproject_id?: string
  file: File
  level: number
}

export const FileNode = ({
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

  const isPreview = location.pathname.endsWith('/preview')
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    place_id2 && action_id
      ? urlPath[0] === 'projects' &&
        urlPath[1] === project_id &&
        urlPath[2] === 'subprojects' &&
        urlPath[3] === subproject_id &&
        urlPath[4] === 'places' &&
        urlPath[5] === place_id &&
        urlPath[6] === 'places' &&
        urlPath[7] === place_id2 &&
        urlPath[8] === 'actions' &&
        urlPath[9] === action_id &&
        urlPath[10] === 'files' &&
        params.file_id === file.file_id
      : place_id2 && check_id
      ? urlPath[0] === 'projects' &&
        urlPath[1] === project_id &&
        urlPath[2] === 'subprojects' &&
        urlPath[3] === subproject_id &&
        urlPath[4] === 'places' &&
        urlPath[5] === place_id &&
        urlPath[6] === 'places' &&
        urlPath[7] === place_id2 &&
        urlPath[8] === 'checks' &&
        urlPath[9] === check_id &&
        urlPath[10] === 'files' &&
        params.file_id === file.file_id
      : !place_id2 && action_id
      ? urlPath[0] === 'projects' &&
        urlPath[1] === project_id &&
        urlPath[2] === 'subprojects' &&
        urlPath[3] === subproject_id &&
        urlPath[4] === 'places' &&
        urlPath[5] === place_id &&
        urlPath[6] === 'actions' &&
        urlPath[7] === action_id &&
        urlPath[8] === 'files' &&
        params.file_id === file.file_id
      : !place_id2 && check_id
      ? urlPath[0] === 'projects' &&
        urlPath[1] === project_id &&
        urlPath[2] === 'subprojects' &&
        urlPath[3] === subproject_id &&
        urlPath[4] === 'places' &&
        urlPath[5] === place_id &&
        urlPath[6] === 'checks' &&
        urlPath[7] === check_id &&
        urlPath[8] === 'files' &&
        params.file_id === file.file_id
      : place_id2
      ? urlPath[0] === 'projects' &&
        urlPath[1] === project_id &&
        urlPath[2] === 'subprojects' &&
        urlPath[3] === subproject_id &&
        urlPath[4] === 'places' &&
        urlPath[5] === place_id &&
        urlPath[6] === 'places' &&
        urlPath[7] === place_id2 &&
        urlPath[8] === 'files' &&
        params.file_id === file.file_id
      : place_id
      ? urlPath[0] === 'projects' &&
        urlPath[1] === project_id &&
        urlPath[2] === 'subprojects' &&
        urlPath[3] === subproject_id &&
        urlPath[4] === 'places' &&
        urlPath[5] === place_id &&
        urlPath[6] === 'files' &&
        params.file_id === file.file_id
      : subproject_id
      ? urlPath[0] === 'projects' &&
        urlPath[1] === project_id &&
        urlPath[2] === 'subprojects' &&
        urlPath[3] === subproject_id &&
        urlPath[4] === 'files' &&
        params.file_id === file.file_id
      : project_id
      ? urlPath[0] === 'projects' &&
        urlPath[1] === project_id &&
        urlPath[2] === 'files' &&
        params.file_id === file.file_id
      : urlPath[0] === 'files' && params.file_id === file.file_id
  const isActive = isOpen && urlPath.length === level

  const baseUrl = `${project_id ? `/projects/${project_id}` : ''}${
    subproject_id ? `/subprojects/${subproject_id}` : ''
  }${place_id ? `/places/${place_id}` : ''}${
    place_id2 ? `/places/${place_id2}` : ''
  }${action_id ? `/actions/${action_id}` : ''}${
    check_id ? `/checks/${check_id}` : ''
  }/files`

  const onClickButton = useCallback(() => {
    if (isOpen) {
      return navigate({ pathname: baseUrl, search: searchParams.toString() })
    }
    navigate({
      pathname: `${baseUrl}/${file.file_id}`,
      search: searchParams.toString(),
    })
  }, [isOpen, navigate, baseUrl, file.file_id, searchParams])

  return (
    <Node
      node={file}
      level={level}
      isOpen={isOpen}
      isInActiveNodeArray={isOpen}
      isActive={isActive}
      childrenCount={0}
      to={`${baseUrl}/${file.file_id}${isPreview ? '/preview' : ''}`}
      onClickButton={onClickButton}
    />
  )
}
