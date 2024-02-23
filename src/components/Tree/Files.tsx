import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { Files as File } from '../../../generated/client'
import { FileNode } from './File'

export const FilesNode = ({
  project_id = null,
  subproject_id = null,
  level,
}) => {
  const location = useLocation()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results: files = [] } = useLiveQuery(
    db.files.liveMany({
      where: {
        deleted: false,
        project_id,
        subproject_id,
      },
      orderBy: { label: 'asc' },
    }),
  )

  const filesNode = useMemo(
    () => ({ label: `Files (${files.length})` }),
    [files.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen = subproject_id
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
  }/files`

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate('/')
    navigate(baseUrl)
  }, [isOpen, navigate])

  return (
    <>
      <Node
        node={filesNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={files.length}
        to={baseUrl}
        onClickButton={onClickButton}
      />
      {isOpen &&
        files.map((file) => (
          <FileNode
            key={file.file_id}
            project_id={project_id}
            subproject_id={subproject_id}
            file={file}
            level={level + 1}
          />
        ))}
    </>
  )
}
