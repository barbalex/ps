import { useCallback, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { createSubprojectReport } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, subproject_id, subproject_report_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()

  const addRow = useCallback(async () => {
    const data = await createSubprojectReport({
      db,
      project_id,
      subproject_id,
    })
    await db.subproject_reports.create({ data })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/reports/${data.subproject_report_id}`,
    )
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, project_id, subproject_id])

  const deleteRow = useCallback(async () => {
    await db.subproject_reports.delete({
      where: {
        subproject_report_id,
      },
    })
    navigate(`/projects/${project_id}/subprojects/${subproject_id}/reports`)
  }, [
    db.subproject_reports,
    navigate,
    project_id,
    subproject_id,
    subproject_report_id,
  ])

  const toNext = useCallback(async () => {
    const subprojectReports = await db.subproject_reports.findMany({
      where: { deleted: false },
      orderBy: { label: 'asc' },
    })
    const len = subprojectReports.length
    const index = subprojectReports.findIndex(
      (p) => p.subproject_report_id === subproject_report_id,
    )
    const next = subprojectReports[(index + 1) % len]
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/reports/${next.subproject_report_id}`,
    )
  }, [
    db.subproject_reports,
    navigate,
    project_id,
    subproject_id,
    subproject_report_id,
  ])

  const toPrevious = useCallback(async () => {
    const subprojectReports = await db.subproject_reports.findMany({
      where: { deleted: false },
      orderBy: { label: 'asc' },
    })
    const len = subprojectReports.length
    const index = subprojectReports.findIndex(
      (p) => p.subproject_report_id === subproject_report_id,
    )
    const previous = subprojectReports[(index + len - 1) % len]
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/reports/${previous.subproject_report_id}`,
    )
  }, [
    db.subproject_reports,
    navigate,
    project_id,
    subproject_id,
    subproject_report_id,
  ])

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
