import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { FileNode } from './File.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'

interface Props {
  project_id?: string
  subproject_id?: string
  place_id?: string
  place_id2?: string
  check_id?: string
  action_id?: string
  level: number
}

export const FilesNode = memo(
  ({
    project_id,
    subproject_id,
    place_id,
    place_id2,
    check_id,
    action_id,
    level,
  }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user: authUser } = useCorbado()

    const { db } = useElectric()!

    const where = useMemo(() => {
      const where = {}
      if (action_id) {
        where.action_id = action_id
      } else if (check_id) {
        where.check_id = check_id
      } else if (place_id2) {
        where.place_id = place_id2
      } else if (place_id) {
        where.place_id = place_id
      } else if (subproject_id) {
        where.subproject_id = subproject_id
      } else if (project_id) {
        where.project_id = project_id
      }
      return where
    }, [action_id, check_id, place_id, place_id2, project_id, subproject_id])

    const { results: files = [] } = useLiveQuery(
      db.files.liveMany({
        where,
        orderBy: { label: 'asc' },
      }),
    )

    const filesNode = useMemo(
      () => ({ label: `Files (${files.length})` }),
      [files.length],
    )

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
          urlPath[10] === 'files'
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
          urlPath[10] === 'files'
        : !place_id2 && action_id
        ? urlPath[0] === 'projects' &&
          urlPath[1] === project_id &&
          urlPath[2] === 'subprojects' &&
          urlPath[3] === subproject_id &&
          urlPath[4] === 'places' &&
          urlPath[5] === place_id &&
          urlPath[6] === 'actions' &&
          urlPath[7] === action_id &&
          urlPath[8] === 'files'
        : !place_id2 && check_id
        ? urlPath[0] === 'projects' &&
          urlPath[1] === project_id &&
          urlPath[2] === 'subprojects' &&
          urlPath[3] === subproject_id &&
          urlPath[4] === 'places' &&
          urlPath[5] === place_id &&
          urlPath[6] === 'checks' &&
          urlPath[7] === check_id &&
          urlPath[8] === 'files'
        : place_id2
        ? urlPath[0] === 'projects' &&
          urlPath[1] === project_id &&
          urlPath[2] === 'subprojects' &&
          urlPath[3] === subproject_id &&
          urlPath[4] === 'places' &&
          urlPath[5] === place_id &&
          urlPath[6] === 'places' &&
          urlPath[7] === place_id2 &&
          urlPath[8] === 'files'
        : place_id
        ? urlPath[0] === 'projects' &&
          urlPath[1] === project_id &&
          urlPath[2] === 'subprojects' &&
          urlPath[3] === subproject_id &&
          urlPath[4] === 'places' &&
          urlPath[5] === place_id &&
          urlPath[6] === 'files'
        : subproject_id
        ? urlPath[0] === 'projects' &&
          urlPath[1] === project_id &&
          urlPath[2] === 'subprojects' &&
          urlPath[3] === subproject_id &&
          urlPath[4] === 'files'
        : project_id
        ? urlPath[0] === 'projects' &&
          urlPath[1] === project_id &&
          urlPath[2] === 'files'
        : urlPath[0] === 'files'
    const isActive = isOpen && urlPath.length === level

    const baseUrl = `${project_id ? `/projects/${project_id}` : ''}${
      subproject_id ? `/subprojects/${subproject_id}` : ''
    }${place_id ? `/places/${place_id}` : ''}${
      place_id2 ? `/places/${place_id2}` : ''
    }${action_id ? `/actions/${action_id}` : ''}${
      check_id ? `/checks/${check_id}` : ''
    }`

    const onClickButton = useCallback(() => {
      if (isOpen) {
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/files`,
        search: searchParams.toString(),
      })
    }, [baseUrl, isOpen, navigate, searchParams])

    return (
      <>
        <Node
          node={filesNode}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isOpen}
          isActive={isActive}
          childrenCount={files.length}
          to={`${baseUrl}/files`}
          onClickButton={onClickButton}
        />
        {isOpen &&
          files.map((file) => (
            <FileNode
              key={file.file_id}
              project_id={project_id}
              subproject_id={subproject_id}
              place_id={place_id}
              place_id2={place_id2}
              action_id={action_id}
              check_id={check_id}
              file={file}
              level={level + 1}
            />
          ))}
      </>
    )
  },
)
