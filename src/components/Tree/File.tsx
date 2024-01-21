import { useCallback } from 'react'
import { useLocation, useParams, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import { Files as File } from '../../../generated/client'

export const FileNode = ({
  file,
  level = 2,
}: {
  files: File[]
  level: number
}) => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen = urlPath[0] === 'files' && params.file_id === file.file_id
  const isActive = isOpen && urlPath.length === 2

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate('/files')
    navigate(`/files/${file.file_id}`)
  }, [isOpen, navigate, file.file_id])

  return (
    <Node
      node={file}
      level={level}
      isOpen={isOpen}
      isInActiveNodeArray={isOpen}
      isActive={isActive}
      childrenCount={0}
      to={`/files/${file.file_id}`}
      onClickButton={onClickButton}
    />
  )
}
