import { useCallback, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(() => {
  const { project_id = null, subproject_id = null, file_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()!

  const baseUrl = `${project_id ? `/projects/${project_id}` : ''}${
    subproject_id ? `/subprojects/${subproject_id}` : ''
  }/files`

  const uploaderCtx = document.querySelector('#uploaderctx')
  const addRow = useCallback(async () => uploaderCtx.initFlow(), [uploaderCtx])

  const deleteRow = useCallback(async () => {
    await db.files.delete({ where: { file_id } })
    navigate(baseUrl)
  }, [db.files, file_id, navigate, baseUrl])

  const toNext = useCallback(async () => {
    const files = await db.files.findMany({
      where: {
        deleted: false,
        project_id,
        subproject_id,
      },
      orderBy: { label: 'asc' },
    })
    const len = files.length
    const index = files.findIndex((p) => p.file_id === file_id)
    const next = files[(index + 1) % len]
    navigate(`${baseUrl}/${next.file_id}`)
  }, [db.files, project_id, subproject_id, navigate, baseUrl, file_id])

  const toPrevious = useCallback(async () => {
    const files = await db.files.findMany({
      where: {
        deleted: false,
        project_id,
        subproject_id,
      },
      orderBy: { label: 'asc' },
    })
    const len = files.length
    const index = files.findIndex((p) => p.file_id === file_id)
    const previous = files[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.file_id}`)
  }, [db.files, project_id, subproject_id, navigate, baseUrl, file_id])

  return (
    <FormHeader
      title="File"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="file"
    />
  )
})
