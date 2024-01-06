import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { Actions as Action } from '../../../generated/client'
import { action as createAction } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { DateField } from '../components/shared/DateField'
import { SwitchField } from '../components/shared/SwitchField'
import { Jsonb } from '../components/shared/Jsonb'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormMenu } from '../components/FormMenu'

import '../form.css'

export const Component = () => {
  const { project_id, subproject_id, place_id, place_id2, action_id } =
    useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.actions.liveUnique({ where: { action_id } }),
    [action_id],
  )

  const addRow = useCallback(async () => {
    const data = await createAction({
      db,
      project_id,
      place_id: place_id2 ?? place_id,
    })
    await db.actions.create({ data })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
        place_id2 ? `/places/${place_id2}` : ''
      }/actions/${data.action_id}`,
    )
  }, [db, navigate, place_id, place_id2, project_id, subproject_id])

  const deleteRow = useCallback(async () => {
    await db.actions.delete({
      where: {
        action_id,
      },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
        place_id2 ? `/places/${place_id2}` : ''
      }/actions`,
    )
  }, [
    action_id,
    db.actions,
    navigate,
    place_id,
    place_id2,
    project_id,
    subproject_id,
  ])

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
    <div className="form-container">
      <FormMenu addRow={addRow} deleteRow={deleteRow} tableName="action" />
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
      />
    </div>
  )
}
