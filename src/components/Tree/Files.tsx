import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { Files as File } from '../../../generated/client'
import { FileNode } from './File'

export const FilesNode = ({ project_id }) => {
  const location = useLocation()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.files.liveMany({
      where: { deleted: false, ...(project_id ? { project_id } : {}) },
      orderBy: { label: 'asc' },
    }),
  )
  const files: File[] = results ?? []

  const filesNode = useMemo(
    () => ({ label: `Files (${files.length})` }),
    [files.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen = project_id
    ? urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'files'
    : urlPath[0] === 'files'
  const isActive = isOpen && urlPath.length === (project_id ? 3 : 1)

  const baseUrl = `${project_id ? `/projects/${project_id}` : ''}/files`

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate('/')
    navigate(baseUrl)
  }, [isOpen, navigate])

  return (
    <>
      <Node
        node={filesNode}
        level={1}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={files.length}
        to={baseUrl}
        onClickButton={onClickButton}
      />
      {isOpen &&
        files.map((file) => <FileNode key={file.file_id} file={file} />)}
    </>
  )
}
