import { useCallback, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { Lists as List } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { createList } from '../modules/createRows'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { SwitchField } from '../components/shared/SwitchField'
import { Jsonb } from '../components/shared/Jsonb'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormMenu } from '../components/FormMenu'

import '../form.css'

export const Component = () => {
  const { project_id, list_id } = useParams()
  const navigate = useNavigate()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.lists.liveUnique({ where: { list_id } }),
    [list_id],
  )

  const baseUrl = `/projects/${project_id}/lists`

  const addRow = useCallback(async () => {
    const data = await createList({ db, project_id })
    await db.lists.create({ data })
    navigate(`${baseUrl}/${data.list_id}`)
    autoFocusRef.current?.focus()
  }, [baseUrl, db, navigate, project_id])

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

  const row: List = results

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.lists.update({
        where: { list_id },
        data: { [name]: value },
      })
    },
    [db.lists, list_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-container">
      <FormMenu
        addRow={addRow}
        deleteRow={deleteRow}
        toNext={toNext}
        toPrevious={toPrevious}
        tableName="list"
      />
      <TextFieldInactive label="ID" name="list_id" value={row.list_id} />
      <TextField
        label="Name"
        name="name"
        value={row.name ?? ''}
        onChange={onChange}
        autoFocus
        ref={autoFocusRef}
      />
      <Jsonb
        table="lists"
        idField="list_id"
        id={row.list_id}
        data={row.data ?? {}}
      />
      <SwitchField
        label="Obsolete"
        name="obsolete"
        value={row.obsolete}
        onChange={onChange}
      />
    </div>
  )
}
