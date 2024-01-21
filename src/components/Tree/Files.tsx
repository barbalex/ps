import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { Files as File } from '../../../generated/client'
import { FileNode } from './File'

export const FilesNode = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.files.liveMany({
      where: { deleted: false },
      orderBy: { label: 'asc' },
    }),
  )
  const files: File[] = results ?? []

  const filesNode = useMemo(
    () => ({
      label: `Files (${files.length})`,
    }),
    [files.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen = urlPath[0] === 'files'
  const isActive = isOpen && urlPath.length === 1

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate('/')
    navigate('/files')
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
        to={`/files`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        files.map((file) => <FileNode key={file.file_id} file={file} />)}
    </>
  )
}
