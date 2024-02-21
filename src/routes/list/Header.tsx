import { useCallback, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { createList } from '../../modules/createRows'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, list_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()!

  const baseUrl = `/projects/${project_id}/lists`

  const addRow = useCallback(async () => {
    const data = await createList({ db, project_id })
    await db.lists.create({ data })
    navigate(`${baseUrl}/${data.list_id}`)
    autoFocusRef.current?.focus()
  }, [autoFocusRef, baseUrl, db, navigate, project_id])

  const deleteRow = useCallback(async () => {
    await db.lists.delete({
      where: { list_id },
    })
    navigate(baseUrl)
  }, [baseUrl, db.lists, list_id, navigate])

  const toNext = useCallback(async () => {
    const lists = await db.lists.findMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    })
    const len = lists.length
    const index = lists.findIndex((p) => p.list_id === list_id)
    const next = lists[(index + 1) % len]
    navigate(`${baseUrl}/${next.list_id}`)
  }, [baseUrl, db.lists, list_id, navigate, project_id])

  const toPrevious = useCallback(async () => {
    const lists = await db.lists.findMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    })
    const len = lists.length
    const index = lists.findIndex((p) => p.list_id === list_id)
    const previous = lists[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.list_id}`)
  }, [baseUrl, db.lists, list_id, navigate, project_id])

  return (
    <FormHeader
      title="List"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="list"
    />
  )
})
