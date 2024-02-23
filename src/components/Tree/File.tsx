import { useCallback } from 'react'
import { useLocation, useParams, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import { Files as File } from '../../../generated/client'

type Props = {
  project_id?: string
  file: File
  level: number
}

export const FileNode = ({ project_id, file, level = 2 }: Props) => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen = project_id
    ? urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'files' &&
      params.file_id === file.file_id
    : urlPath[0] === 'files' && params.file_id === file.file_id
  const isActive = isOpen && urlPath.length === level

  const baseUrl = `${project_id ? `/projects/${project_id}` : ''}/files/${
    file.file_id
  }`

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate('/files')
    navigate(baseUrl)
  }, [isOpen, navigate, file.file_id])

  return (
    <Node
      node={file}
      level={level}
      isOpen={isOpen}
      isInActiveNodeArray={isOpen}
      isActive={isActive}
      childrenCount={0}
      to={baseUrl}
      onClickButton={onClickButton}
    />
  )
}
