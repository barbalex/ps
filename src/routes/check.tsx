import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { Checks as Check } from '../../../generated/client'
import { check as createCheck } from '../modules/dataPresets'
import { useElectric } from '../ElectricProvider'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { DateField } from '../components/shared/DateField'
import { SwitchField } from '../components/shared/SwitchField'
import { Jsonb } from '../components/shared/Jsonb'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormMenu } from '../components/FormMenu'

import '../form.css'

export const Component = () => {
  const { project_id, subproject_id, place_id, place_id2, check_id } =
    useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.checks.liveUnique({ where: { check_id } }),
    [check_id],
  )

  const addRow = useCallback(async () => {
    const data = await createCheck({
      db,
      project_id,
      place_id: place_id2 ?? place_id,
    })
    await db.checks.create({ data })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
        place_id2 ? `/places/${place_id2}` : ''
      }/checks/${data.check_id}`,
    )
  }, [db, navigate, place_id, place_id2, project_id, subproject_id])

  const deleteRow = useCallback(async () => {
    await db.checks.delete({
      where: {
        check_id,
      },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
        place_id2 ? `/places/${place_id2}` : ''
      }/checks`,
    )
  }, [
    check_id,
    db.checks,
    navigate,
    place_id,
    place_id2,
    project_id,
    subproject_id,
  ])

  const row: Check = results

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.checks.update({
        where: { check_id },
        data: { [name]: value },
      })
    },
    [db.checks, check_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-container">
      <FormMenu addRow={addRow} deleteRow={deleteRow} tableName="check" />
      <TextFieldInactive label="ID" name="check_id" value={row.check_id} />
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
        table="checks"
        idField="check_id"
        id={row.check_id}
        data={row.data ?? {}}
        autoFocus
      />
    </div>
  )
}
