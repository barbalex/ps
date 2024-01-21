import { useCallback, useRef, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { PlaceReports as PlaceReport } from '../../../generated/client'
import { createPlaceReport } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { Jsonb } from '../components/shared/Jsonb'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormHeader } from '../components/FormHeader'

import '../form.css'

export const Component = () => {
  const { project_id, subproject_id, place_id, place_id2, place_report_id } =
    useParams()
  const navigate = useNavigate()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.place_reports.liveUnique({ where: { place_report_id } }),
    [place_report_id],
  )

  const baseUrl = useMemo(
    () =>
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
        place_id2 ? `/places/${place_id2}` : ''
      }/reports`,
    [place_id, place_id2, project_id, subproject_id],
  )

  const addRow = useCallback(async () => {
    const data = await createPlaceReport({
      db,
      project_id,
      place_id: place_id2 ?? place_id,
    })
    await db.place_reports.create({ data })
    navigate(`${baseUrl}/${data.place_report_id}`)
    autoFocusRef.current?.focus()
  }, [baseUrl, db, navigate, place_id, place_id2, project_id])

  const deleteRow = useCallback(async () => {
    await db.place_reports.delete({
      where: {
        place_report_id,
      },
    })
    navigate(baseUrl)
  }, [baseUrl, db.place_reports, navigate, place_report_id])

  const toNext = useCallback(async () => {
    const placeReports = await db.place_reports.findMany({
      where: { deleted: false, place_id: place_id2 ?? place_id },
      orderBy: { label: 'asc' },
    })
    const len = placeReports.length
    const index = placeReports.findIndex(
      (p) => p.place_report_id === place_report_id,
    )
    const next = placeReports[(index + 1) % len]
    navigate(`${baseUrl}/${next.place_report_id}`)
  }, [
    baseUrl,
    db.place_reports,
    navigate,
    place_id,
    place_id2,
    place_report_id,
  ])

  const toPrevious = useCallback(async () => {
    const placeReports = await db.place_reports.findMany({
      where: { deleted: false, place_id: place_id2 ?? place_id },
      orderBy: { label: 'asc' },
    })
    const len = placeReports.length
    const index = placeReports.findIndex(
      (p) => p.place_report_id === place_report_id,
    )
    const previous = placeReports[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.place_report_id}`)
  }, [
    baseUrl,
    db.place_reports,
    navigate,
    place_id,
    place_id2,
    place_report_id,
  ])

  const row: PlaceReport = results

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.place_reports.update({
        where: { place_report_id },
        data: { [name]: value },
      })
    },
    [db.place_reports, place_report_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-outer-container">
      <FormHeader
        title="Place Report"
        addRow={addRow}
        deleteRow={deleteRow}
        toNext={toNext}
        toPrevious={toPrevious}
        tableName="place report"
      />
      <div className="form-container">
        <TextFieldInactive
          label="ID"
          name="place_report_id"
          value={row.place_report_id}
        />
        <TextField
          label="Year"
          name="year"
          type="number"
          value={row.year ?? ''}
          onChange={onChange}
        />
        <Jsonb
          table="place_reports"
          idField="place_report_id"
          id={row.place_report_id}
          data={row.data ?? {}}
          autoFocus
          ref={autoFocusRef}
        />
      </div>
    </div>
  )
}
