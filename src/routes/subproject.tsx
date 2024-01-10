import { useCallback, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { Subprojects as Subproject } from '../../../generated/client'
import { createSubproject } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { Jsonb } from '../components/shared/Jsonb'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormMenu } from '../components/FormMenu'

import '../form.css'

export const Component = () => {
  const { project_id, subproject_id } = useParams()
  const navigate = useNavigate()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.subprojects.liveUnique({ where: { subproject_id } }),
  )

  const addRow = useCallback(async () => {
    const data = await createSubproject({ db, project_id })
    await db.subprojects.create({ data })
    navigate(`/projects/${project_id}/subprojects/${data.subproject_id}`)
    autoFocusRef.current?.focus()
  }, [db, navigate, project_id])

  const deleteRow = useCallback(async () => {
    await db.subprojects.delete({
      where: { subproject_id },
    })
    navigate(`/projects/${project_id}/subprojects`)
  }, [db.subprojects, navigate, project_id, subproject_id])

  const toNext = useCallback(async () => {
    const subprojects = await db.subprojects.findMany({
      where: { deleted: false },
      orderBy: { label: 'asc' },
    })
    const len = subprojects.length
    const index = subprojects.findIndex(
      (p) => p.subproject_id === subproject_id,
    )
    const next = subprojects[(index + 1) % len]
    navigate(`/projects/${project_id}/subprojects/${next.subproject_id}`)
  }, [db.subprojects, navigate, project_id, subproject_id])

  const toPrevious = useCallback(async () => {
    const subprojects = await db.subprojects.findMany({
      where: { deleted: false },
      orderBy: { label: 'asc' },
    })
    const len = subprojects.length
    const index = subprojects.findIndex(
      (p) => p.subproject_id === subproject_id,
    )
    const previous = subprojects[(index + len - 1) % len]
    navigate(`/projects/${project_id}/subprojects/${previous.subproject_id}`)
  }, [db.subprojects, navigate, project_id, subproject_id])

  const row: Subproject = results

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.subprojects.update({
        where: { subproject_id },
        data: { [name]: value },
      })
    },
    [db.subprojects, subproject_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  // console.log('subproject, row.data:', row?.data)

  return (
    <div className="form-container">
      <FormMenu
        addRow={addRow}
        deleteRow={deleteRow}
        toNext={toNext}
        toPrevious={toPrevious}
        tableName="subproject" // TODO: use subproject_name_singular
      />
      <TextFieldInactive
        label="ID"
        name="subproject_id"
        value={row.subproject_id ?? ''}
      />
      <TextField
        label="Name"
        name="name"
        value={row.name ?? ''}
        onChange={onChange}
        autoFocus
        ref={autoFocusRef}
      />
      <TextField
        label="Since year"
        name="since_year"
        value={row.since_year ?? ''}
        type="number"
        onChange={onChange}
      />
      <Jsonb
        table="subprojects"
        idField="subproject_id"
        id={row.subproject_id}
        data={row.data ?? {}}
      />
    </div>
  )
}
