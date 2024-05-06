import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { createProjectReport } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider.tsx'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, project_report_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!

  const addRow = useCallback(async () => {
    const data = await createProjectReport({ db, project_id })
    await db.project_reports.create({ data })
    navigate({
      pathname: `../${data.project_report_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, project_id, searchParams])

  const deleteRow = useCallback(async () => {
    await db.project_reports.delete({ where: { project_report_id } })
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db.project_reports, navigate, project_report_id, searchParams])

  const toNext = useCallback(async () => {
    const projectReports = await db.project_reports.findMany({
      where: {  project_id },
      orderBy: { label: 'asc' },
    })
    const len = projectReports.length
    const index = projectReports.findIndex(
      (p) => p.project_report_id === project_report_id,
    )
    const next = projectReports[(index + 1) % len]
    navigate({
      pathname: `../${next.project_report_id}`,
      search: searchParams.toString(),
    })
  }, [
    db.project_reports,
    navigate,
    project_id,
    project_report_id,
    searchParams,
  ])

  const toPrevious = useCallback(async () => {
    const projectReports = await db.project_reports.findMany({
      where: {  project_id },
      orderBy: { label: 'asc' },
    })
    const len = projectReports.length
    const index = projectReports.findIndex(
      (p) => p.project_report_id === project_report_id,
    )
    const previous = projectReports[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.project_report_id}`,
      search: searchParams.toString(),
    })
  }, [
    db.project_reports,
    navigate,
    project_id,
    project_report_id,
    searchParams,
  ])

  return (
    <FormHeader
      title="Project Report"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="project report"
    />
  )
})
