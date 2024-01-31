import { useCallback, useMemo, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { Checks as Check } from '../../../generated/client'
import { createCheck } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive'
import { DateField } from '../../components/shared/DateField'
import { SwitchField } from '../../components/shared/SwitchField'
import { Jsonb } from '../../components/shared/Jsonb'
import { getValueFromChange } from '../../modules/getValueFromChange'
import { FormHeader } from '../../components/FormHeader'

import '../../form.css'

export const Component = () => {
  const { project_id, subproject_id, place_id, place_id2, check_id } =
    useParams()
  const navigate = useNavigate()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.checks.liveUnique({ where: { check_id } }),
  )

  const baseUrl = useMemo(
    () =>
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
        place_id2 ? `/places/${place_id2}` : ''
      }/checks`,
    [place_id, place_id2, project_id, subproject_id],
  )

  const addRow = useCallback(async () => {
    const data = await createCheck({
      db,
      project_id,
      place_id: place_id2 ?? place_id,
    })
    await db.checks.create({ data })
    navigate(`${baseUrl}/${data.check_id}`)
    autoFocusRef.current?.focus()
  }, [baseUrl, db, navigate, place_id, place_id2, project_id])

  const deleteRow = useCallback(async () => {
    await db.checks.delete({
      where: {
        check_id,
      },
    })
    navigate(baseUrl)
  }, [baseUrl, check_id, db.checks, navigate])

  const toNext = useCallback(async () => {
    const checks = await db.checks.findMany({
      where: { deleted: false, place_id: place_id2 ?? place_id },
      orderBy: { label: 'asc' },
    })
    const len = checks.length
    const index = checks.findIndex((p) => p.check_id === check_id)
    const next = checks[(index + 1) % len]
    navigate(`${baseUrl}/${next.check_id}`)
  }, [baseUrl, check_id, db.checks, navigate, place_id, place_id2])

  const toPrevious = useCallback(async () => {
    const checks = await db.checks.findMany({
      where: { deleted: false, place_id: place_id2 ?? place_id },
      orderBy: { label: 'asc' },
    })
    const len = checks.length
    const index = checks.findIndex((p) => p.check_id === check_id)
    const previous = checks[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.check_id}`)
  }, [baseUrl, check_id, db.checks, navigate, place_id, place_id2])

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
    <div className="form-outer-container">
      <FormHeader
        title="Check"
        addRow={addRow}
        deleteRow={deleteRow}
        toNext={toNext}
        toPrevious={toPrevious}
        tableName="check"
      />
      <div className="form-container">
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
          ref={autoFocusRef}
        />
      </div>
    </div>
  )
}
