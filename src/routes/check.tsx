import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'
import { Switch } from '@fluentui/react-components'

import { Checks as Check } from '../../../generated/client'
import { check as createCheckPreset } from '../modules/dataPresets'
import { useElectric } from '../ElectricProvider'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { DateField } from '../components/shared/DateField'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormMenu } from '../components/FormMenu'

import '../form.css'

export const Component = () => {
  const { project_id, subproject_id, place_id, check_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.checks.liveUnique({ where: { check_id } }),
    [check_id],
  )

  const addRow = useCallback(async () => {
    const newCheck = createCheckPreset()
    await db.checks.create({
      data: { ...newCheck, place_id },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/checks/${newCheck.check_id}`,
    )
  }, [db.checks, navigate, place_id, project_id, subproject_id])

  const deleteRow = useCallback(async () => {
    await db.checks.delete({
      where: {
        check_id,
      },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/checks`,
    )
  }, [check_id, db.checks, navigate, place_id, project_id, subproject_id])

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
      <Switch
        label="relevant for reports"
        name="relevant_for_reports"
        checked={row.relevant_for_reports ?? false}
        onChange={onChange}
      />
    </div>
  )
}
