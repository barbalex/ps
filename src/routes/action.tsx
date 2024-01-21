import { useCallback, useMemo, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { Actions as Action } from '../../../generated/client'
import { createAction } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { DateField } from '../components/shared/DateField'
import { SwitchField } from '../components/shared/SwitchField'
import { Jsonb } from '../components/shared/Jsonb'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormHeader } from '../components/FormHeader'

import '../form.css'

export const Component = () => {
  const { project_id, subproject_id, place_id, place_id2, action_id } =
    useParams()
  const navigate = useNavigate()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.actions.liveUnique({ where: { action_id } }),
    [action_id],
  )

  const baseUrl = useMemo(
    () =>
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
        place_id2 ? `/places/${place_id2}` : ''
      }/actions`,
    [place_id, place_id2, project_id, subproject_id],
  )

  const addRow = useCallback(async () => {
    const data = await createAction({
      db,
      project_id,
      place_id: place_id2 ?? place_id,
    })
    await db.actions.create({ data })
    navigate(`${baseUrl}/${data.action_id}`)
    autoFocusRef.current?.focus()
  }, [baseUrl, db, navigate, place_id, place_id2, project_id])

  const deleteRow = useCallback(async () => {
    await db.actions.delete({
      where: {
        action_id,
      },
    })
    navigate(baseUrl)
  }, [action_id, baseUrl, db.actions, navigate])

  const toNext = useCallback(async () => {
    const actions = await db.actions.findMany({
      where: { deleted: false, place_id: place_id2 ?? place_id },
      orderBy: { label: 'asc' },
    })
    const len = actions.length
    const index = actions.findIndex((p) => p.action_id === action_id)
    const next = actions[(index + 1) % len]
    navigate(`${baseUrl}/${next.action_id}`)
  }, [action_id, baseUrl, db.actions, navigate, place_id, place_id2])

  const toPrevious = useCallback(async () => {
    const actions = await db.actions.findMany({
      where: { deleted: false, place_id: place_id2 ?? place_id },
      orderBy: { label: 'asc' },
    })
    const len = actions.length
    const index = actions.findIndex((p) => p.action_id === action_id)
    const previous = actions[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.action_id}`)
  }, [action_id, baseUrl, db.actions, navigate, place_id, place_id2])

  const row: Action = results

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.actions.update({
        where: { action_id },
        data: { [name]: value },
      })
    },
    [db.actions, action_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-outer-container">
      <FormHeader
        title="Action"
        addRow={addRow}
        deleteRow={deleteRow}
        toNext={toNext}
        toPrevious={toPrevious}
        tableName="action"
      />
      <div className="form-container">
        <TextFieldInactive label="ID" name="action_id" value={row.action_id} />
        <DateField
          label="Date"
          name="date"
          value={row.date}
          onChange={onChange}
        />
        <SwitchField
          label="relevant for reports"
          name="relevant_for_reports"
          value={row.relevant_for_reports}
          onChange={onChange}
        />
        <Jsonb
          table="actions"
          idField="action_id"
          id={row.action_id}
          data={row.data ?? {}}
          autoFocus
          ref={autoFocusRef}
        />
      </div>
    </div>
  )
}
