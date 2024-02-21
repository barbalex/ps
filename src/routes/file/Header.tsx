import { useCallback, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { createFile } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(() => {
  const { file_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()!

  const addRow = useCallback(async () => {
    const data = await createFile({ db })
    await db.files.create({ data })
    navigate(`/files/${data.file_id}`)
  }, [db, navigate])

  const deleteRow = useCallback(async () => {
    await db.files.delete({
      where: {
        file_id,
      },
    })
    navigate(`/files`)
  }, [file_id, db.files, navigate])

  const toNext = useCallback(async () => {
    const files = await db.files.findMany({
      where: { deleted: false },
      orderBy: { label: 'asc' },
    })
    const len = files.length
    const index = files.findIndex((p) => p.file_id === file_id)
    const next = files[(index + 1) % len]
    navigate(`/files/${next.file_id}`)
  }, [db.files, navigate, file_id])

  const toPrevious = useCallback(async () => {
    const files = await db.files.findMany({
      where: { deleted: false },
      orderBy: { label: 'asc' },
    })
    const len = files.length
    const index = files.findIndex((p) => p.file_id === file_id)
    const previous = files[(index + len - 1) % len]
    navigate(`/files/${previous.file_id}`)
  }, [db.files, navigate, file_id])

  return (
    <FormHeader
      title="File"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="file value"
    />
  )
})
