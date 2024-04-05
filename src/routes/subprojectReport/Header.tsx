import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { createSubprojectReport } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, subproject_id, subproject_report_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!

  const addRow = useCallback(async () => {
    const data = await createSubprojectReport({
      db,
      project_id,
      subproject_id,
    })
    await db.subproject_reports.create({ data })
    navigate({
      pathname: `../${data.subproject_report_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, project_id, searchParams, subproject_id])

  const deleteRow = useCallback(async () => {
    await db.subproject_reports.delete({
      where: {
        subproject_report_id,
      },
    })
    navigate({ pathname: `..`, search: searchParams.toString() })
  }, [db.subproject_reports, navigate, searchParams, subproject_report_id])

  const toNext = useCallback(async () => {
    const subprojectReports = await db.subproject_reports.findMany({
      orderBy: { label: 'asc' },
    })
    const len = subprojectReports.length
    const index = subprojectReports.findIndex(
      (p) => p.subproject_report_id === subproject_report_id,
    )
    const next = subprojectReports[(index + 1) % len]
    navigate({
      pathname: `../${next.subproject_report_id}`,
      search: searchParams.toString(),
    })
  }, [db.subproject_reports, navigate, searchParams, subproject_report_id])

  const toPrevious = useCallback(async () => {
    const subprojectReports = await db.subproject_reports.findMany({
      orderBy: { label: 'asc' },
    })
    const len = subprojectReports.length
    const index = subprojectReports.findIndex(
      (p) => p.subproject_report_id === subproject_report_id,
    )
    const previous = subprojectReports[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.subproject_report_id}`,
      search: searchParams.toString(),
    })
  }, [db.subproject_reports, navigate, searchParams, subproject_report_id])

  return (
    <FormHeader
      title="Subproject Report"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="subproject report"
    />
  )
})
