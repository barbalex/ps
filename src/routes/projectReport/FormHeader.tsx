import { useCallback, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { createProjectReport } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

export const FormHeaderComponent = memo(({ autoFocusRef }) => {
  const { project_id, project_report_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()

  const baseUrl = `/projects/${project_id}/reports`

  const addRow = useCallback(async () => {
    const data = await createProjectReport({ db, project_id })
    await db.project_reports.create({ data })
    navigate(`${baseUrl}/${data.project_report_id}`)
    autoFocusRef.current?.focus()
  }, [autoFocusRef, baseUrl, db, navigate, project_id])

  const deleteRow = useCallback(async () => {
    await db.project_reports.delete({
      where: { project_report_id },
    })
    navigate(baseUrl)
  }, [baseUrl, db.project_reports, navigate, project_report_id])

  const toNext = useCallback(async () => {
    const projectReports = await db.project_reports.findMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    })
    const len = projectReports.length
    const index = projectReports.findIndex(
      (p) => p.project_report_id === project_report_id,
    )
    const next = projectReports[(index + 1) % len]
    navigate(`${baseUrl}/${next.project_report_id}`)
  }, [baseUrl, db.project_reports, navigate, project_id, project_report_id])

  const toPrevious = useCallback(async () => {
    const projectReports = await db.project_reports.findMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    })
    const len = projectReports.length
    const index = projectReports.findIndex(
      (p) => p.project_report_id === project_report_id,
    )
    const previous = projectReports[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.project_report_id}`)
  }, [baseUrl, db.project_reports, navigate, project_id, project_report_id])

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
